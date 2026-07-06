export interface OrderItem {
  productId: number | string;
  name: string;
  price: number;
  quantity: number;
}

export type PaymentMethod = 'efectivo' | 'yape';

export interface Order {
  id?: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  yapeCode?: string;
  yapeCaptureName?: string;
  yapeCaptureData?: string;
  status: 'confirmado' | 'pendiente_verificacion';
  createdAt: string;
}
