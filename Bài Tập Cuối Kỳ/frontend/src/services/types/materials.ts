export interface Material {
  id: number;
  name: string;
  quantity: number;
  lowStockThreshold: number;
  managedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMaterialParams {
  name: string;
  quantity: number;
  lowStockThreshold?: number;
}

export interface UpdateMaterialParams {
  name: string;
  quantity: number;
  lowStockThreshold?: number;
}