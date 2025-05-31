export interface StatsCache {
    id: number;
    type: 'residents' | 'inventory' | 'finance' | 'vehicles';
    data: any;
    created_at: Date;
  }