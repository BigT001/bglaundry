import { prisma } from '@/lib/prisma';

type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  tags?: Array<{ name: string; value: string }>;
};

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!,
  );

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const shell = (title: string, preheader: string, content: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f6fa;font-family:Arial,sans-serif;color:#172036">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fa;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e5e9f0">
<tr><td style="background:#102b72;padding:22px 28px;color:#fff"><div style="font-weight:800;font-size:20px">BG Laundry</div><div style="font-size:12px;color:#cbd8f5;margin-top:3px">Cleaner clothes. Better look. Better you.</div></td></tr>
<tr><td style="padding:30px 28px"><h1 style="font-size:24px;line-height:1.2;margin:0 0 18px">${escapeHtml(title)}</h1>${content}</td></tr>
<tr><td style="padding:18px 28px;background:#f8fafc;color:#718096;font-size:12px">BG Laundry · 0705 815 5555</td></tr>
</table></td></tr></table></body></html>`;

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'BG Laundry <onboarding@resend.dev>';
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY is not configured.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, ...message }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error(`[Email] Resend returned ${response.status}:`, detail.slice(0, 500));
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Email] Unable to reach Resend:', error);
    return false;
  }
}

async function adminNotificationEmails() {
  const primaryAdmin = 'bglaundry01@gmail.com';
  try {
    const settings = await prisma.notificationSettings.findUnique({
      where: { id: 'default' },
      select: { adminEmails: true },
    });
    if (settings?.adminEmails.length) {
      const list = settings.adminEmails.map(e => e.trim().toLowerCase());
      if (!list.includes(primaryAdmin)) list.unshift(primaryAdmin);
      return list.slice(0, 5);
    }
  } catch (error) {
    console.error('[Email] Unable to load notification recipients:', error);
  }
  const envEmails = (process.env.ADMIN_NOTIFICATION_EMAILS || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || '')
    .split(',').map(email => email.trim().toLowerCase()).filter(Boolean);

  if (!envEmails.includes(primaryAdmin)) {
    envEmails.unshift(primaryAdmin);
  }
  return envEmails.slice(0, 5);
}

export async function sendRiderArrivalEmails(input: { orderNumber: string; customerName: string; place: string }) {
  const recipients = await adminNotificationEmails();
  if (!recipients.length) return false;
  const title = `Rider arrived for ${input.orderNumber}`;
  const text = `The rider has arrived at the ${input.place} location for ${input.orderNumber} (${input.customerName}).`;
  return sendEmail({
    to: recipients,
    subject: title,
    html: shell(title, text, `<p style="color:#526077;line-height:1.6">${escapeHtml(text)}</p>`),
    text,
    tags: [{ name: 'category', value: 'rider-arrival' }],
  });
}

type OrderEmailInput = {
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  pickupAddress: string;
  pickupDate: Date;
  totalAmount: number;
  items: Array<{ serviceName: string; quantity: number; price: number }>;
};

export async function sendNewOrderEmails(order: OrderEmailInput) {
  const adminEmails = await adminNotificationEmails();
  const itemRows = order.items.map(item =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">${escapeHtml(item.serviceName)} × ${item.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #edf0f4">${money.format(item.price * item.quantity)}</td></tr>`,
  ).join('');
  const details = `<p style="color:#526077;line-height:1.6">A new order has been created and is awaiting payment confirmation.</p>
  <div style="background:#f7f9fc;border-radius:12px;padding:16px;margin:20px 0">
    <p style="margin:0 0 8px"><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
    <p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</p>
    <p style="margin:0 0 8px"><strong>Pickup:</strong> ${escapeHtml(order.pickupDate.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }))}</p>
    <p style="margin:0"><strong>Address:</strong> ${escapeHtml(order.pickupAddress)}</p>
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemRows}<tr><td style="padding-top:14px"><strong>Total</strong></td><td align="right" style="padding-top:14px;font-size:18px"><strong>${money.format(order.totalAmount)}</strong></td></tr></table>`;

  const deliveries: Promise<boolean>[] = [];
  if (adminEmails.length) {
    deliveries.push(sendEmail({
      to: adminEmails,
      subject: `New order ${order.orderNumber} · ${money.format(order.totalAmount)}`,
      html: shell(`New order ${order.orderNumber}`, `New BG Laundry order from ${order.customerName}`, details),
      text: `New order ${order.orderNumber}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nPickup: ${order.pickupDate.toLocaleString('en-NG')}\nAddress: ${order.pickupAddress}\nTotal: ${money.format(order.totalAmount)}`,
      tags: [{ name: 'category', value: 'new-order' }],
    }));
  }
  if (order.customerEmail) {
    deliveries.push(sendEmail({
      to: order.customerEmail,
      subject: `We received your BG Laundry order ${order.orderNumber}`,
      html: shell(`Order ${order.orderNumber} received`, 'Your BG Laundry order has been received.', `<p style="color:#526077;line-height:1.6">Hello ${escapeHtml(order.customerName)}, your order has been created. Complete payment to confirm your pickup.</p>${details}`),
      text: `Hello ${order.customerName}, we received order ${order.orderNumber}. Complete payment to confirm your pickup. Total: ${money.format(order.totalAmount)}.`,
      tags: [{ name: 'category', value: 'order-received' }],
    }));
  }
  return Promise.all(deliveries);
}

export async function sendPaymentConfirmedEmails(order: OrderEmailInput) {
  const adminEmails = await adminNotificationEmails();
  const itemRows = order.items.map(item =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #edf0f4">${escapeHtml(item.serviceName)} × ${item.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #edf0f4">${money.format(item.price * item.quantity)}</td></tr>`,
  ).join('');
  const details = `<p style="color:#047857;font-weight:bold;line-height:1.6">✅ Payment Confirmed! Action required: Assign a rider for pickup.</p>
  <div style="background:#f7f9fc;border-radius:12px;padding:16px;margin:20px 0">
    <p style="margin:0 0 8px"><strong>Customer Name:</strong> ${escapeHtml(order.customerName)}</p>
    <p style="margin:0 0 8px"><strong>Customer Phone:</strong> ${escapeHtml(order.customerPhone)}</p>
    <p style="margin:0 0 8px"><strong>Pickup Date:</strong> ${escapeHtml(order.pickupDate.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }))}</p>
    <p style="margin:0"><strong>Pickup Address:</strong> ${escapeHtml(order.pickupAddress)}</p>
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemRows}<tr><td style="padding-top:14px"><strong>Total Paid</strong></td><td align="right" style="padding-top:14px;font-size:18px;color:#047857"><strong>${money.format(order.totalAmount)}</strong></td></tr></table>`;

  const deliveries: Promise<boolean>[] = [];
  if (adminEmails.length) {
    deliveries.push(sendEmail({
      to: adminEmails,
      subject: `🚨 PAID ORDER ${order.orderNumber} · ${money.format(order.totalAmount)} · ${order.customerName}`,
      html: shell(`PAID Order ${order.orderNumber}`, `Paid BG Laundry order from ${order.customerName}`, details),
      text: `PAID ORDER ${order.orderNumber}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nPickup: ${order.pickupDate.toLocaleString('en-NG')}\nAddress: ${order.pickupAddress}\nTotal Paid: ${money.format(order.totalAmount)}`,
      tags: [{ name: 'category', value: 'order-paid' }],
    }));
  }
  if (order.customerEmail) {
    deliveries.push(sendEmail({
      to: order.customerEmail,
      subject: `Payment Confirmed - BG Laundry Order ${order.orderNumber}`,
      html: shell(`Payment Confirmed - Order ${order.orderNumber}`, 'Your BG Laundry payment was successful.', `<p style="color:#526077;line-height:1.6">Hello ${escapeHtml(order.customerName)}, your payment has been confirmed! A rider will be assigned shortly for pickup.</p>${details}`),
      text: `Hello ${order.customerName}, payment confirmed for order ${order.orderNumber}. Total Paid: ${money.format(order.totalAmount)}.`,
      tags: [{ name: 'category', value: 'payment-confirmed' }],
    }));
  }
  return Promise.all(deliveries);
}

export async function sendNewUserSignupEmails(user: {
  fullName: string;
  email: string;
  phoneNumber: string;
  pickupAddress: string;
}) {
  const adminEmails = await adminNotificationEmails();
  const details = `<p style="color:#1e40af;font-weight:bold;line-height:1.6">👤 New Customer Registered on BG Laundry!</p>
  <div style="background:#f7f9fc;border-radius:12px;padding:16px;margin:20px 0">
    <p style="margin:0 0 8px"><strong>Full Name:</strong> ${escapeHtml(user.fullName)}</p>
    <p style="margin:0 0 8px"><strong>Email Address:</strong> ${escapeHtml(user.email)}</p>
    <p style="margin:0 0 8px"><strong>Phone Number:</strong> ${escapeHtml(user.phoneNumber)}</p>
    <p style="margin:0"><strong>Pickup Address:</strong> ${escapeHtml(user.pickupAddress)}</p>
  </div>`;

  const deliveries: Promise<boolean>[] = [];
  if (adminEmails.length) {
    deliveries.push(sendEmail({
      to: adminEmails,
      subject: `👤 New Customer Registration · ${user.fullName} (${user.phoneNumber})`,
      html: shell(`New Customer Registration`, `New user account created: ${user.fullName}`, details),
      text: `NEW CUSTOMER REGISTRATION\nName: ${user.fullName}\nEmail: ${user.email}\nPhone: ${user.phoneNumber}\nAddress: ${user.pickupAddress}`,
      tags: [{ name: 'category', value: 'user-signup' }],
    }));
  }
  return Promise.all(deliveries);
}

export function sendPasswordResetEmail(input: { email: string; fullName: string; code: string }) {
  return sendEmail({
    to: input.email,
    subject: 'Your BG Laundry password reset code',
    html: shell('Reset your password', 'Your BG Laundry password reset code.', `<p style="color:#526077;line-height:1.6">Hello ${escapeHtml(input.fullName)}, use the code below to reset your password. It expires in 10 minutes.</p><div style="font-size:32px;letter-spacing:8px;font-weight:800;text-align:center;background:#f2f5fb;border-radius:12px;padding:20px;margin:24px 0">${escapeHtml(input.code)}</div><p style="color:#718096;font-size:13px">If you did not request this, you can safely ignore this email. Never share this code.</p>`),
    text: `Your BG Laundry password reset code is ${input.code}. It expires in 10 minutes. Do not share it.`,
    tags: [{ name: 'category', value: 'password-reset' }],
  });
}
