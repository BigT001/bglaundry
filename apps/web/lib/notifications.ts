export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: any,
) {
  if (!token?.startsWith('ExponentPushToken[')) {
    return { success: false, error: 'Invalid Expo push token' };
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      channelId: 'orders',
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.warn('[Expo Push Error]', response.status, payload);
    return { success: false, error: payload?.message || 'Expo push request failed' };
  }

  return { success: true, result: payload };
}

const statusMessages: Record<string, { title: string; body: (orderNumber: string) => string }> = {
  PAYMENT_PENDING: {
    title: 'Payment pending',
    body: orderNumber => `Order ${orderNumber} is waiting for payment.`,
  },
  PICKUP_PENDING: {
    title: 'Payment confirmed',
    body: orderNumber => `Order ${orderNumber} is confirmed. Pickup will be arranged shortly.`,
  },
  PICKUP_IN_PROGRESS: {
    title: 'Rider on the way',
    body: orderNumber => `Your rider is heading to pick up order ${orderNumber}.`,
  },
  PICKED_UP: {
    title: 'Laundry picked up',
    body: orderNumber => `Order ${orderNumber} has been picked up.`,
  },
  PROCESSING: {
    title: 'Laundry in progress',
    body: orderNumber => `Order ${orderNumber} is now being processed.`,
  },
  DELIVERY_PENDING: {
    title: 'Ready for delivery',
    body: orderNumber => `Order ${orderNumber} is ready for delivery.`,
  },
  DELIVERY_IN_PROGRESS: {
    title: 'Delivery on the way',
    body: orderNumber => `Your rider is delivering order ${orderNumber}.`,
  },
  DELIVERED: {
    title: 'Order delivered',
    body: orderNumber => `Order ${orderNumber} has been delivered. Thank you for choosing BG Laundry.`,
  },
  CANCELLED: {
    title: 'Order cancelled',
    body: orderNumber => `Order ${orderNumber} has been cancelled.`,
  },
};

export async function notifyCustomerOrderStatus(input: {
  pushToken?: string | null;
  orderNumber: string,
  status: string,
  orderId?: string,
}) {
  if (!input.pushToken) return { success: false, error: 'Customer has no push token' };

  const message = statusMessages[input.status] || {
    title: 'Order update',
    body: (orderNumber: string) => `Order ${orderNumber} is now ${input.status.toLowerCase().replaceAll('_', ' ')}.`,
  };

  return sendPushNotification(
    input.pushToken,
    message.title,
    message.body(input.orderNumber),
    {
      type: 'ORDER_STATUS',
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      status: input.status,
    },
  );
}
