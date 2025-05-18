export interface Invoice {
    id: number;
    amount: number;
    description: string;
    status: 'pending' | 'paid';
    created_at: Date;
    created_by: number;
  }