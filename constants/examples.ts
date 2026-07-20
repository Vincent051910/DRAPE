import type { Mood } from '@/constants/theme';

export type ExampleOutfit = {
  id: string;
  title: string;
  mood: Mood;
  blurb: string;
  imageUri: string;
  /** Visible garments / accessories in the photo */
  pieces: string[];
};

/**
 * Curated full-body examples (women and men). Image URLs and `pieces`
 * were checked against the actual Unsplash photos.
 */
export const exampleOutfits: ExampleOutfit[] = [
  {
    id: 'ex-clean-1',
    title: 'White stairs',
    mood: 'Clean',
    blurb: 'One bright dress and sneakers — nothing else competing.',
    imageUri:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=80',
    pieces: [
      'White off-shoulder mini dress',
      'White canvas sneakers',
      'White ankle socks',
      'Thin silver bracelet',
    ],
  },
  {
    id: 'ex-men-clean-1',
    title: 'Camel longline',
    mood: 'Clean',
    blurb: 'A long coat over a white tee and light denim.',
    imageUri:
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&q=80',
    pieces: [
      'Camel wool overcoat',
      'White crewneck t-shirt',
      'Light-wash slim jeans',
      'Cream and black high-top sneakers',
      'Silver ring',
    ],
  },
  {
    id: 'ex-street-1',
    title: 'Bridge leather',
    mood: 'Street',
    blurb: 'Beanie, biker jacket, and skinny jeans on the road.',
    imageUri:
      'https://images.unsplash.com/photo-1599839575784-3f3bf15cb473?w=900&q=80',
    pieces: [
      'Grey knit beanie',
      'Round metal sunglasses',
      'Black leather biker jacket',
      'White t-shirt',
      'Black skinny jeans',
      'Black sneakers with white soles',
    ],
  },
  {
    id: 'ex-men-street-1',
    title: 'Underpass layers',
    mood: 'Street',
    blurb: 'Hooded jacket, graphic tee, and bright sneakers.',
    imageUri:
      'https://images.unsplash.com/photo-1598798918315-e954298ef4cb?w=900&q=80',
    pieces: [
      'Charcoal patterned zip hoodie',
      'White graphic t-shirt',
      'Dark green joggers',
      'Teal sneakers with white soles',
    ],
  },
  {
    id: 'ex-evening-1',
    title: 'Olive mural',
    mood: 'Evening',
    blurb: 'A fitted midi dress against a loud backdrop.',
    imageUri:
      'https://images.unsplash.com/photo-1726071134803-24e8d1c58811?w=900&q=80',
    pieces: [
      'Olive green midi dress',
      'Nude platform heels',
      'Gold hoop earrings',
    ],
  },
  {
    id: 'ex-men-evening-1',
    title: 'All-black stride',
    mood: 'Evening',
    blurb: 'Black blazer, shirt, and Chelsea boots — sharp and simple.',
    imageUri:
      'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=900&q=80',
    pieces: [
      'Black slim blazer',
      'White pocket square',
      'Black collared shirt',
      'Black slim trousers',
      'Black Chelsea boots',
      'Round metal sunglasses',
      'Silver watch',
    ],
  },
  {
    id: 'ex-clean-2',
    title: 'Cream knit',
    mood: 'Clean',
    blurb: 'Sweater dress plus knee boots — soft neutrals only.',
    imageUri:
      'https://images.unsplash.com/photo-1634463052781-11027eac90c8?w=900&q=80',
    pieces: [
      'Cream ribbed turtleneck sweater dress',
      'Tan suede knee-high boots',
      'Gold rings',
    ],
  },
  {
    id: 'ex-men-editorial-1',
    title: 'Navy rail',
    mood: 'Editorial',
    blurb: 'Matching navy suit with white sneakers instead of dress shoes.',
    imageUri:
      'https://images.unsplash.com/photo-1627379114594-7aff6664cd94?w=900&q=80',
    pieces: [
      'Navy slim blazer',
      'White crewneck t-shirt',
      'Matching navy slim trousers',
      'White low-top sneakers',
      'Round dark sunglasses',
      'Silver bracelets',
    ],
  },
  {
    id: 'ex-editorial-1',
    title: 'Navy cut',
    mood: 'Editorial',
    blurb: 'A sharp matching suit with a small structured bag.',
    imageUri:
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=900&q=80',
    pieces: [
      'Navy peplum blazer',
      'Matching navy tailored trousers',
      'Black pointed stilettos',
      'Light grey quilted handbag',
      'Gold pendant necklace',
    ],
  },
  {
    id: 'ex-street-2',
    title: 'Court yellow',
    mood: 'Street',
    blurb: 'Matching hoodie and joggers with sharp white boots.',
    imageUri:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80',
    pieces: [
      'Mustard yellow cropped hoodie',
      'Matching yellow joggers',
      'White pointed heeled ankle boots',
      'Gold hoop earrings',
    ],
  },
  {
    id: 'ex-men-street-2',
    title: 'Platform print',
    mood: 'Street',
    blurb: 'Printed camp shirt with light jeans underground.',
    imageUri:
      'https://images.unsplash.com/photo-1762316834347-4854715c7b0d?w=900&q=80',
    pieces: [
      'White embroidered camp-collar shirt',
      'Light-wash paneled jeans',
      'White sneakers',
      'Silver chain necklace',
    ],
  },
  {
    id: 'ex-editorial-2',
    title: 'Orange column',
    mood: 'Editorial',
    blurb: 'Printed blouse against wide orange trousers.',
    imageUri:
      'https://images.unsplash.com/photo-1652184513381-9755426e7fd2?w=900&q=80',
    pieces: [
      'Floral mock-neck blouse',
      'Orange wide-leg trousers',
      'Tan heeled sandals',
      'Green square earrings',
    ],
  },
  {
    id: 'ex-evening-2',
    title: 'Plaza layers',
    mood: 'Evening',
    blurb: 'Blazer over a soft shirt with dark jeans.',
    imageUri:
      'https://images.unsplash.com/photo-1599330293148-164c1e10c8c0?w=900&q=80',
    pieces: [
      'Dark navy blazer',
      'Beige button-down shirt',
      'White camisole',
      'Dark skinny jeans',
      'Brown belt with gold buckle',
      'White platform sneakers',
      'Gold pendant necklace',
      'Gold watch',
    ],
  },
  {
    id: 'ex-men-editorial-2',
    title: 'Grey coffee walk',
    mood: 'Editorial',
    blurb: 'Blazer, white tee, and dark jeans for a city day.',
    imageUri:
      'https://images.unsplash.com/photo-1630173250799-2813d34ed14b?w=900&q=80',
    pieces: [
      'Grey single-button blazer',
      'White crewneck t-shirt',
      'Dark skinny jeans',
      'White low-top sneakers',
      'Black rectangular sunglasses',
      'Silver watch',
    ],
  },
];

export function getExampleById(id: string): ExampleOutfit | undefined {
  return exampleOutfits.find((e) => e.id === id);
}
