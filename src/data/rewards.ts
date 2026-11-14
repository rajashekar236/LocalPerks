export type Reward = {
  id: string;
  title: string;
  cost: number;
  /** Business that honors the reward, or undefined for any participating business. */
  businessId?: string;
};

export const REWARDS: Reward[] = [
  { id: 'free-coffee', title: 'Free drink at Riverbend Coffee', cost: 150, businessId: 'riverbend-coffee' },
  { id: 'five-off', title: '$5 off at any participating business', cost: 400 },
  { id: 'arcade-tokens', title: '20 arcade tokens', cost: 250, businessId: 'main-street-arcade' },
  { id: 'ten-off', title: '$10 off at any participating business', cost: 750 },
];
