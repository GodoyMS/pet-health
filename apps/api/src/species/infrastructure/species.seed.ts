export interface SpeciesSeed {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
}

export const SPECIES_SEED_DATA: SpeciesSeed[] = [
  {
    name: 'Dog',
    slug: 'dog',
    description:
      'Loyal, intelligent, and friendly companions known for their adaptability.',
    imageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=80&q=80',
    order: 1,
  },
  {
    name: 'Cat',
    slug: 'cat',
    description:
      'Independent and affectionate pets with playful and curious personalities.',
    imageUrl:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=80&q=80',
    order: 2,
  },
  {
    name: 'Bird',
    slug: 'bird',
    description:
      'Social and intelligent animals that can be lively and engaging companions.',
    imageUrl:
      'https://images.unsplash.com/photo-1501706362039-c6e80948bbf0?auto=format&fit=crop&w=80&q=80',
    order: 3,
  },
  {
    name: 'Rabbit',
    slug: 'rabbit',
    description:
      'Gentle and social pets that thrive in calm and nurturing environments.',
    imageUrl:
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=80&q=80',
    order: 4,
  },
  {
    name: 'Fish',
    slug: 'fish',
    description:
      'Low-maintenance pets that bring color and tranquility to any space.',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=80&q=80',
    order: 5,
  },
  {
    name: 'Hamster',
    slug: 'hamster',
    description:
      'Small, friendly rodents ideal for compact living spaces.',
    imageUrl:
      'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=80&q=80',
    order: 6,
  },
  {
    name: 'Turtle',
    slug: 'turtle',
    description:
      'Calm and long-living reptiles that make unique and fascinating pets.',
    imageUrl:
      'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=80&q=80',
    order: 7,
  },
  {
    name: 'Guinea Pig',
    slug: 'guinea-pig',
    description:
      'Social and vocal companions that enjoy interaction and companionship.',
    imageUrl:
      'https://images.unsplash.com/photo-1583512603869-9f5c6e9a78f5?auto=format&fit=crop&w=80&q=80',
    order: 8,
  },
];

