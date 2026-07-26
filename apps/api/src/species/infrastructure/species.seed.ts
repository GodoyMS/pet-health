export interface BreedSeed {
  name: string;
  /**
   * Typical lifespan in whole years (well-cared reference midpoint).
   * Use `null` for generic entries (Mixed / Other) where no single range applies.
   */
  expectedLifespanYears: number | null;
}

export interface SpeciesSeed {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
  breeds: BreedSeed[];
}

export const SPECIES_SEED_DATA: SpeciesSeed[] = [
  {
    name: "Dog",
    slug: "dog",
    description:
      "Loyal, intelligent, and friendly companions known for their adaptability.",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=80&q=80",
    order: 1,
    breeds: [
      { name: "Golden Retriever", expectedLifespanYears: 12 },
      { name: "Labrador Retriever", expectedLifespanYears: 11 },
      { name: "German Shepherd", expectedLifespanYears: 10 },
      { name: "French Bulldog", expectedLifespanYears: 11 },
      { name: "Poodle", expectedLifespanYears: 13 },
      { name: "Beagle", expectedLifespanYears: 12 },
      { name: "Rottweiler", expectedLifespanYears: 9 },
      { name: "Yorkshire Terrier", expectedLifespanYears: 13 },
      { name: "Boxer", expectedLifespanYears: 10 },
      { name: "Dachshund", expectedLifespanYears: 14 },
      { name: "Siberian Husky", expectedLifespanYears: 12 },
      { name: "Shih Tzu", expectedLifespanYears: 13 },
      { name: "Chihuahua", expectedLifespanYears: 15 },
      { name: "Border Collie", expectedLifespanYears: 13 },
      { name: "Cocker Spaniel", expectedLifespanYears: 13 },
      { name: "Doberman Pinscher", expectedLifespanYears: 11 },
      { name: "Great Dane", expectedLifespanYears: 8 },
      { name: "Pug", expectedLifespanYears: 13 },
      { name: "Maltese", expectedLifespanYears: 13 },
      { name: "Akita", expectedLifespanYears: 11 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  },
  {
    name: "Cat",
    slug: "cat",
    description:
      "Independent and affectionate pets with playful and curious personalities.",
    imageUrl:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=80&q=80",
    order: 2,
    breeds: [
      { name: "Persian", expectedLifespanYears: 14 },
      { name: "Siamese", expectedLifespanYears: 12 },
      { name: "Maine Coon", expectedLifespanYears: 13 },
      { name: "British Shorthair", expectedLifespanYears: 15 },
      { name: "Ragdoll", expectedLifespanYears: 15 },
      { name: "Bengal", expectedLifespanYears: 14 },
      { name: "Sphynx", expectedLifespanYears: 14 },
      { name: "Scottish Fold", expectedLifespanYears: 12 },
      { name: "Russian Blue", expectedLifespanYears: 15 },
      { name: "Norwegian Forest Cat", expectedLifespanYears: 14 },
      { name: "Exotic Shorthair", expectedLifespanYears: 12 },
      { name: "Domestic Shorthair", expectedLifespanYears: 15 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  },
  {
    name: "Bird",
    slug: "bird",
    description:
      "Social and intelligent animals that can be lively and engaging companions.",
    imageUrl:
      "https://images.unsplash.com/photo-1501706362039-c6e80948bbf0?auto=format&fit=crop&w=80&q=80",
    order: 3,
    breeds: [
      { name: "Budgerigar", expectedLifespanYears: 8 },
      { name: "Cockatiel", expectedLifespanYears: 15 },
      { name: "Canary", expectedLifespanYears: 10 },
      { name: "Lovebird", expectedLifespanYears: 15 },
      { name: "Conure", expectedLifespanYears: 20 },
      { name: "African Grey Parrot", expectedLifespanYears: 45 },
      { name: "Macaw", expectedLifespanYears: 45 },
      { name: "Finch", expectedLifespanYears: 10 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  },
  {
    name: "Rabbit",
    slug: "rabbit",
    description:
      "Gentle and social pets that thrive in calm and nurturing environments.",
    imageUrl:
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=80&q=80",
    order: 4,
    breeds: [
      { name: "Holland Lop", expectedLifespanYears: 10 },
      { name: "Mini Rex", expectedLifespanYears: 9 },
      { name: "Dutch", expectedLifespanYears: 9 },
      { name: "Lionhead", expectedLifespanYears: 9 },
      { name: "Flemish Giant", expectedLifespanYears: 7 },
      { name: "English Lop", expectedLifespanYears: 9 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  },
  {
    name: "Fish",
    slug: "fish",
    description:
      "Low-maintenance pets that bring color and tranquility to any space.",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=80&q=80",
    order: 5,
    breeds: [
      { name: "Betta", expectedLifespanYears: 4 },
      { name: "Goldfish", expectedLifespanYears: 15 },
      { name: "Guppy", expectedLifespanYears: 2 },
      { name: "Tetra", expectedLifespanYears: 5 },
      { name: "Angelfish", expectedLifespanYears: 10 },
      { name: "Cichlid", expectedLifespanYears: 12 },
      { name: "Molly", expectedLifespanYears: 5 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  },
  {
    name: "Hamster",
    slug: "hamster",
    description:
      "Small, friendly rodents ideal for compact living spaces.",
    imageUrl:
      "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=80&q=80",
    order: 6,
    breeds: [
      { name: "Syrian", expectedLifespanYears: 3 },
      { name: "Dwarf Roborovski", expectedLifespanYears: 3 },
      { name: "Winter White", expectedLifespanYears: 2 },
      { name: "Chinese", expectedLifespanYears: 3 },
      { name: "Campbell's Dwarf", expectedLifespanYears: 3 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  },
  {
    name: "Turtle",
    slug: "turtle",
    description:
      "Calm and long-living reptiles that make unique and fascinating pets.",
    imageUrl:
      "https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=80&q=80",
    order: 7,
    breeds: [
      { name: "Red-eared Slider", expectedLifespanYears: 25 },
      { name: "Box Turtle", expectedLifespanYears: 40 },
      { name: "Painted Turtle", expectedLifespanYears: 25 },
      { name: "Map Turtle", expectedLifespanYears: 20 },
      { name: "Snapping Turtle", expectedLifespanYears: 35 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  },
  {
    name: "Guinea Pig",
    slug: "guinea-pig",
    description:
      "Social and vocal companions that enjoy interaction and companionship.",
    imageUrl:
      "https://images.unsplash.com/photo-1583512603869-9f5c6e9a78f5?auto=format&fit=crop&w=80&q=80",
    order: 8,
    breeds: [
      { name: "American", expectedLifespanYears: 7 },
      { name: "Abyssinian", expectedLifespanYears: 7 },
      { name: "Peruvian", expectedLifespanYears: 7 },
      { name: "Teddy", expectedLifespanYears: 7 },
      { name: "Silkie", expectedLifespanYears: 7 },
      { name: "Mixed", expectedLifespanYears: null },
      { name: "Other", expectedLifespanYears: null }
    ]
  }
];
