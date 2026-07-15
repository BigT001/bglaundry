export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: any,
) {
  console.log(`[FCM Notification] Sending to device token "${token}"`);
  console.log(`[FCM Notification] Title: "${title}"`);
  console.log(`[FCM Notification] Body: "${body}"`);
  if (data) {
    console.log(`[FCM Notification] Payload Data:`, data);
  }
  return { success: true, messageId: `msg-${Date.now()}` };
}

export async function notifyOrderStatusUpdate(
  phoneNumber: string,
  orderNumber: string,
  status: string,
) {
  console.log(
    `[SMS/Push Update] Notify user at ${phoneNumber}: Order ${orderNumber} status changed to ${status}`,
  );
  return { success: true };
}
