/**
 * Build-time Vite plugins shared by the web and admin apps.
 *
 * Kept at the repo root so both apps use one copy; the Dockerfiles COPY this
 * directory alongside the workspace packages.
 */

/**
 * Emits a <link rel="preload"> for the subsetted Material Symbols font.
 *
 * Icons are referenced only from CSS, so without this the browser cannot even
 * discover the font until the app stylesheet has downloaded and parsed — a
 * full extra round trip during which every icon is blank (the @font-face uses
 * `font-display: block`). The filename is content-hashed at build time, so the
 * tag has to be injected once the asset name is known rather than hard-coded
 * in index.html.
 */
export function preloadIconFont() {
  return {
    name: "preload-icon-font",
    apply: "build",
    enforce: "post",

    transformIndexHtml: {
      // `post` so the bundle is populated: the font is emitted while the CSS
      // that references it is transformed, which happens before the HTML
      // plugin runs its own generateBundle.
      order: "post",
      handler(html, ctx) {
        const asset = Object.values(ctx.bundle ?? {}).find(
          (output) =>
            output.type === "asset" &&
            /material-symbols-outlined-subset.*\.woff2$/.test(output.fileName),
        );
        // Losing the tag only costs the round trip it was meant to save, so a
        // renamed font file degrades rather than breaking the build.
        if (!asset) return html;

        return {
          html,
          tags: [
            {
              tag: "link",
              attrs: {
                rel: "preload",
                as: "font",
                type: "font/woff2",
                href: `/${asset.fileName}`,
                // Fonts are always fetched in CORS mode; without this the
                // preloaded copy is discarded and downloaded a second time.
                crossorigin: "anonymous",
              },
              // "head", not "head-prepend": the preload scanner reads the
              // whole <head> before running anything, so placement within it
              // costs nothing, and prepending would push <meta charset> down.
              injectTo: "head",
            },
          ],
        };
      },
    },
  };
}
