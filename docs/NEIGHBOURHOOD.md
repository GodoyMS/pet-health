# Neighbourhood of the Pets

An immersive, tilted 3D map where each pet has its own live location, discovers
nearby pets (with same-species pets visually privileged), and builds a friend
network through a Facebook-style request inbox.

**Status: implemented.** Route `/dashboard/neighbourhood`, menu entry
"Neighbourhood".

---

## 1. Quick start

```bash
# 1. Browser key for the map (apps/web/.env)
VITE_GOOGLE_MAPS_API_KEY=...
# Required for the tilted 3D view — must be a VECTOR Map ID with tilt+rotation:
VITE_GOOGLE_MAPS_NEIGHBOURHOOD_MAP_ID=...

# 2. Populate the map with demo neighbours (development only)
cd apps/api
pnpm run seed:neighbours -- --lat 28.6139 --lng 77.209 --radius 1500 --count 12
pnpm run seed:neighbours:clear   # removes them again
```

No new API keys are needed on the server: nearby-pet search runs against our own
database, not Google.

> **The vector Map ID is not optional for the 3D effect.** Tilt and heading are
> silently ignored on raster maps (including `DEMO_MAP_ID`) — the map renders
> fine but stays flat. Create one in Google Cloud Console → Map Management →
> Create Map ID → type "JavaScript", rendering "Vector", then enable Tilt and
> Rotation. The camera code guards every tilt/heading call, so an unset Map ID
> degrades to a flat map rather than throwing.

---

## 2. Domain model

Two new bounded contexts, both owned by `apps/api/src/neighbourhood/`. The
`pets` module is **untouched** — location and friendship are neighbourhood
concerns, not pet-identity concerns.

### 2.1 Location

```
owner_locations                    pet_locations
─────────────────                  ─────────────────
userId   (PK, 1:1 user)            petId      (PK, 1:1 pet)
lat      double precision          lat        double precision
lng      double precision          lng        double precision
updatedAt timestamptz              source     'inherited' | 'manual'
                                   isDiscoverable boolean (default true)
                                   updatedAt  timestamptz
                                   index (lat, lng)
```

The `source` column is what makes "default to owner, then override per pet"
fall out cleanly:

- **`inherited`** — the pet follows the owner. When the owner's location is
  upserted, every inherited pet moves in the same transaction. Initial state
  for every pet.
- **`manual`** — the pet was placed explicitly (pin drag or map click). Owner
  movement no longer touches it.
- **"Follow me"** flips `manual` → `inherited` and re-syncs.

Rows are created lazily: the first geolocation fix upserts `owner_locations`
and backfills a `pet_locations` row for every pet the user owns.

### 2.2 Friendship

One table doubles as request *and* friendship (Facebook's model) — a single
state machine, no duplication, no sync bugs between two tables.

```
pet_friendships
─────────────────
id            uuid PK
requesterPetId uuid FK → pets (CASCADE)
addresseePetId uuid FK → pets (CASCADE)
pairKey       varchar UNIQUE      -- sorted(`${idA}:${idB}`)
status        'pending' | 'accepted' | 'rejected' | 'cancelled'
createdAt / respondedAt timestamptz
index (addresseePetId, status), (requesterPetId, status)
```

`pairKey` is the integrity backbone: a sorted, direction-independent key under
a unique index means "A asked B" and "B asked A" are the *same row*. No race
can produce a duplicate friendship — and the service also catches the `23505`
unique violation for the simultaneous-request case.

**State machine** — [`domain/friendship-policy.ts`](../apps/api/src/neighbourhood/domain/friendship-policy.ts),
pure functions with no I/O, exhaustively unit-tested:

| From | Action | To | Who may act |
| --- | --- | --- | --- |
| — | request | `pending` | requester pet's owner |
| `pending` | accept | `accepted` | addressee pet's owner |
| `pending` | reject | `rejected` | addressee pet's owner |
| `pending` | cancel | `cancelled` | requester pet's owner |
| `accepted` | unfriend | `cancelled` | either owner |
| `rejected` / `cancelled` | re-request | `pending` | either owner (row reused) |

Invariants: a pet cannot befriend itself, and two pets of the **same owner**
cannot be friends (they already share a household — it would just be inbox
noise).

---

## 3. Privacy

The feature publishes the approximate location of strangers' pets, which in
practice is their *owners'* home location. Three safeguards, all on by default:

1. **Coordinate fuzzing** — other owners' pets are snapped to the centre of a
   deterministic ~120 m cell, with a **per-pet grid origin** derived from the
   pet id so cell boundaries can't be correlated across pets to triangulate
   true positions. Your own pets are always exact *to you*.
2. **`isDiscoverable` per pet**, default on, toggled from the map's editor bar.
   Off = invisible to other owners, still fully usable on your own map.
3. **No owner PII** — display name only. Never email, never owner id.

Distances are measured against the **fuzzed** point, so the number in the
popover always agrees with the pin actually drawn. Friendship unlocks pet
details, never coordinates.

> Note: the longitude cell width must be derived from the *snapped* latitude.
> Deriving it from the raw latitude makes the longitude grid slide continuously
> as a pet drifts north/south, so the output never quantises and every GPS tick
> republishes a new point — defeating the whole mechanism. This is covered by a
> regression test.

---

## 4. API

All endpoints are `@UseGuards(AuthGuard)` and Swagger-annotated. Every `:petId`
is ownership-checked and returns **404, not 403**, for pets the user doesn't
own — so the endpoints can't be used to probe which pet ids exist.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/neighbourhood/pets` | My pets + locations + friendship badge counts (boots the tab bar in one round-trip) |
| `GET` | `/neighbourhood/owner-location` | My anchor location, if set |
| `PUT` | `/neighbourhood/owner-location` | Set my location; cascades to inherited pets; returns the refreshed pet list |
| `PUT` | `/neighbourhood/pets/:petId/location` | Pin a pet explicitly → `manual` |
| `POST` | `/neighbourhood/pets/:petId/location/follow-owner` | Revert to `inherited` |
| `PATCH` | `/neighbourhood/pets/:petId/discoverability` | Show/hide on other maps |
| `GET` | `/neighbourhood/pets/:petId/nearby?radius=` | Nearby pets (200 m–20 km, default 2 km) |
| `GET` | `/pet-friendships/inbox` | **All** pending requests across **all** my pets, split incoming/outgoing |
| `GET` | `/pet-friendships/friends` | Accepted friendships across **all** my pets, each naming which pet |
| `POST` | `/pet-friendships` | `{ requesterPetId, addresseePetId }` |
| `PATCH` | `/pet-friendships/:id` | `{ action: accept \| reject \| cancel \| unfriend }` |

### Nearby search

No PostGIS (not installed, and `synchronize: true` can't add extensions).
Instead, two stages:

1. **Bounding-box prefilter in SQL**, served by the `(lat, lng)` index.
   Longitude delta is scaled by `1/cos(lat)`, clamped at the poles, and the
   antimeridian wrap is handled as a union of two spans.
2. **Exact haversine + sort in memory**, capped at 50 markers.

The box is inflated by one privacy cell so a pet whose *fuzzed* position lands
inside the radius is never dropped by the prefilter.

Excluded from results: non-discoverable pets and pets of the same owner.

The map deliberately shows **only the active pet** from the user's household.
Drawing the whole household at once made it ambiguous whose neighbourhood was
on screen — which pet the radius ring belonged to, and which pet a friend
request would come from. Other pets are reached through the tab bar instead.

`ST_DWithin` is the upgrade path if pet counts ever make the bbox scan hurt;
the service interface won't change.

### "Live"

Polling, not WebSockets: `refetchInterval` of 15 s for nearby pets and 30 s for
the inbox. `@nestjs/websockets` isn't installed, a gateway brings auth/scaling/
reconnect complexity, and pet locations change on the order of minutes. The
`useNearbyPets` hook is the single seam where a socket transport can replace
polling without touching a component.

---

## 5. Web module

`apps/web/src/modules/neighbourhood/`

```
api/          neighbourhoodApi.ts · petFriendshipsApi.ts
hooks/        queryKeys.ts · useNeighbourhood.ts · useMapCamera.ts
              usePetLocationMutations.ts · useFriendshipMutations.ts
components/   PetTabBar · NeighbourhoodMap · ActivePetMarker · NearbyPetMarker
              NearbyPetPopover · FriendshipSidebar · LocationEditorBar
              CameraControls · RadiusRing · PetAvatar
utils/        speciesTheme.ts · format.ts · motion.ts
pages/        NeighbourhoodPage.tsx
```

**Active pet lives in the URL** (`?pet=<id>`), so a tab switch is a navigation:
the view is deep-linkable, and the nearby query key is the single source of
truth for what the map renders.

**The immersive layer.** Vector map at `tilt: 60` with free heading; the active
pet renders as a large species avatar with a ground shadow, a 2.4 s bob, and
the **owner avatar as a companion** tucked behind its shoulder. Same-species
pets are privileged on three independent channels — saturated species halo,
larger avatar, and a slow pulse — so the distinction survives greyscale and
colour-blindness; other species render smaller and desaturated. A translucent
radius ring (a Maps `Circle`, so it stays glued to the ground plane under tilt)
makes "who counts as nearby" legible. Every animation is disabled under
`prefers-reduced-motion`.

**Moving a pet** — three affordances, all routed through one mutation hook with
optimistic cache writes and rollback-with-toast: drag the pin, "Drop here" then
tap the map, or "Follow me" to re-attach to your live position.

**Friendship UX** — clicking a nearby pin opens a popover whose single CTA is
derived from the friendship row (send / withdraw / respond / friends+remove).
Below `lg` the sidebar becomes a sheet behind a badged button.

**Sidebar scope.** All three tabs (Requests / Sent / Friends) describe the
*same* set of pets, chosen by one filter at the top: **All pets** (the default,
because a request to any pet is time-sensitive and hiding it behind a filter is
how you miss it) or just the active pet. Filtering is client-side over the
aggregated payload, so switching scope is instant with no refetch.

Scope is also restated on every row — each card names which of *your* pets it
concerns ("wants to meet Milo", "friends with Luna"), so the list reads
unambiguously even before anyone notices the filter. The filter is hidden
entirely for single-pet owners, where it would be meaningless.

This replaced an earlier version where Requests and Sent were household-wide
but Friends was silently scoped to the active pet: the three counts didn't
describe a consistent world, and nothing on screen said which was which.

---

## 6. Tests

```bash
cd apps/api && pnpm test     # 53 tests
cd apps/web && pnpm test:run # 39 tests
```

- `friendship-policy.spec.ts` — every legal transition, every illegal one,
  authorization per side, self-friendship, same-owner rejection, pairKey
  canonicalisation, and a total sweep asserting no action ever yields an
  unknown state.
- `haversine.spec.ts` — known distances, symmetry, bounding boxes that provably
  contain the whole circle, high-latitude widening, pole clamping, antimeridian
  wrap.
- `location-privacy.spec.ts` — determinism, bounded drift, per-pet grid
  origins, and the quantisation regression described in §3.
- Web: `format`, `speciesTheme`, `PetTabBar` badge behaviour, and the full
  `NearbyPetPopover` CTA state matrix.

---

## 7. Notes for future work

- **Per-pet photos.** Pets have no image column, so markers use
  `species.imageUrl` with a themed glyph fallback. Real pet photos would
  meaningfully raise the immersion.
- **Marker clustering** beyond the 50-marker cap.
- **PostGIS** if the bounding-box scan becomes a bottleneck.
- **WebSocket transport** behind `useNearbyPets` if genuinely live movement
  becomes a requirement.
