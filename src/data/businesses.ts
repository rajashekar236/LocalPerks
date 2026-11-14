// Demo data: fictional local businesses around downtown Frankfort, KY.
export type Category = 'Food' | 'Coffee' | 'Shopping' | 'Services' | 'Fun';

export type Business = {
  id: string;
  name: string;
  category: Category;
  address: string;
  latitude: number;
  longitude: number;
  /** Points earned per $1 spent (city boosts raise this). */
  multiplier: number;
  /** Optional city-sponsored boost shown as a badge. */
  boost?: string;
  description: string;
  emoji: string;
};

export const CATEGORIES: Category[] = ['Food', 'Coffee', 'Shopping', 'Services', 'Fun'];

export const BUSINESSES: Business[] = [
  {
    id: 'riverbend-coffee',
    name: 'Riverbend Coffee Co.',
    category: 'Coffee',
    address: '210 W Main St',
    latitude: 38.2009,
    longitude: -84.8733,
    multiplier: 3,
    boost: '3x weekend boost',
    description: 'Small-batch roasts and pastries baked every morning.',
    emoji: '☕',
  },
  {
    id: 'capitol-diner',
    name: 'Capitol Diner',
    category: 'Food',
    address: '115 St Clair St',
    latitude: 38.2003,
    longitude: -84.8718,
    multiplier: 2,
    boost: '2x lunch hours',
    description: 'Classic Kentucky comfort food, open for breakfast and lunch.',
    emoji: '🍳',
  },
  {
    id: 'old-town-books',
    name: 'Old Town Books',
    category: 'Shopping',
    address: '302 W Broadway St',
    latitude: 38.1996,
    longitude: -84.8751,
    multiplier: 1,
    description: 'New and used books, with a kids corner and weekly readings.',
    emoji: '📚',
  },
  {
    id: 'bluegrass-bikes',
    name: 'Bluegrass Bikes',
    category: 'Services',
    address: '48 Wilkinson Blvd',
    latitude: 38.2031,
    longitude: -84.8792,
    multiplier: 2,
    description: 'Bike repairs, rentals, and gear for riverside trails.',
    emoji: '🚲',
  },
  {
    id: 'kentucky-river-tacos',
    name: 'Kentucky River Tacos',
    category: 'Food',
    address: '401 W Main St',
    latitude: 38.2012,
    longitude: -84.8771,
    multiplier: 1,
    description: 'Street tacos and fresh salsas with a patio by the river.',
    emoji: '🌮',
  },
  {
    id: 'main-street-arcade',
    name: 'Main Street Arcade',
    category: 'Fun',
    address: '226 W Main St',
    latitude: 38.2007,
    longitude: -84.8740,
    multiplier: 2,
    boost: 'New this month',
    description: 'Retro cabinets, pinball, and family game nights.',
    emoji: '🕹️',
  },
  {
    id: 'frankfort-florist',
    name: 'Frankfort Florist',
    category: 'Shopping',
    address: '88 E Main St',
    latitude: 38.1989,
    longitude: -84.8682,
    multiplier: 1,
    description: 'Fresh bouquets and plants from Kentucky growers.',
    emoji: '💐',
  },
  {
    id: 'clean-cut-barbers',
    name: 'Clean Cut Barbers',
    category: 'Services',
    address: '17 Ann St',
    latitude: 38.1981,
    longitude: -84.8707,
    multiplier: 1,
    description: 'Walk-in haircuts and hot towel shaves.',
    emoji: '💈',
  },
];

/** Downtown Frankfort, used when location permission is denied. */
export const DEFAULT_LOCATION = { latitude: 38.2009, longitude: -84.8733 };

export function getBusiness(id: string): Business | undefined {
  return BUSINESSES.find((b) => b.id === id);
}
