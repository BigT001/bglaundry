export type RiderOrderStatus =
  | 'PICKUP_PENDING'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'PROCESSING'
  | 'DELIVERY_PENDING'
  | 'DELIVERY_IN_PROGRESS'
  | 'DELIVERED'
  | 'CANCELLED';

export type RiderOrder = {
  id: string;
  orderNumber: string;
  status: RiderOrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string | null;
  customer: { fullName: string; phoneNumber: string };
  items: Array<{ id: string; serviceName: string; quantity: number }>;
};

export type RiderSession = {
  token: string;
  rider: { id: string; fullName: string; phoneNumber: string };
};

export const RIDER_SESSION_KEY = 'bg-rider-session';

export function jobKind(status: RiderOrderStatus): 'PICKUP' | 'DELIVERY' | 'WAITING' {
  if (status === 'PICKUP_PENDING' || status === 'PICKUP_IN_PROGRESS') return 'PICKUP';
  if (status === 'DELIVERY_PENDING' || status === 'DELIVERY_IN_PROGRESS') return 'DELIVERY';
  return 'WAITING';
}

export function destinationFor(order: RiderOrder) {
  return jobKind(order.status) === 'DELIVERY' ? order.deliveryAddress : order.pickupAddress;
}

export function canStart(status: RiderOrderStatus) {
  return status === 'PICKUP_PENDING' || status === 'DELIVERY_PENDING';
}

export function nextStartedStatus(status: RiderOrderStatus): RiderOrderStatus | null {
  if (status === 'PICKUP_PENDING') return 'PICKUP_IN_PROGRESS';
  if (status === 'DELIVERY_PENDING') return 'DELIVERY_IN_PROGRESS';
  return null;
}

export function nextConfirmedStatus(status: RiderOrderStatus): RiderOrderStatus | null {
  if (status === 'PICKUP_IN_PROGRESS') return 'PICKED_UP';
  if (status === 'DELIVERY_IN_PROGRESS') return 'DELIVERED';
  return null;
}
