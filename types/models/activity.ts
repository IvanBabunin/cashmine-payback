export type ActivityType = 'accrual' | 'reversal' | 'claim';

export type ActivityItem = {
  id: string;
  type: ActivityType;
  asset: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  exchange: string | null;
  createdAt: string;
  relatedId: string | null;
};

export type ActivityPage = {
  items: ActivityItem[];
  nextCursor: string | null;
};
