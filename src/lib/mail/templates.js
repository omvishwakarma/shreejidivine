import { CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE, SITE_URL } from '../site'
import { formatINR } from '../products'

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, '')
}

function logoUrl() {
  return `${siteBase()}/images/logo.png`
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function emailShell({ title, preheader, bodyHtml }) {
  const logo = logoUrl()
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3ebe0;font-family:Georgia,'Times New Roman',serif;color:#2b1e16;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ebe0;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(43,30,22,0.08);">
          <tr>
            <td style="padding:28px 28px 18px;text-align:center;border-bottom:2px solid #c9a84c;background:linear-gradient(180deg,#fdf8f1,#ffffff);">
              <img src="${esc(logo)}" alt="${esc(SITE_NAME)}" width="88" height="88" style="display:block;margin:0 auto 14px;width:88px;height:88px;object-fit:contain;border:0;" />
              <div style="font-size:22px;letter-spacing:0.08em;font-weight:600;color:#2b1e16;">${esc(SITE_NAME)}</div>
              <div style="margin-top:6px;font-family:system-ui,-apple-system,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b5648;">${esc(SITE_TAGLINE)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-size:15px;line-height:1.6;color:#2b1e16;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px;border-top:1px solid rgba(43,30,22,0.08);font-family:system-ui,-apple-system,sans-serif;font-size:12px;line-height:1.55;color:#6b5648;text-align:center;">
              ${esc(SITE_NAME)} · <a href="${esc(siteBase())}" style="color:#5c4332;">${esc(siteBase().replace(/^https?:\/\//, ''))}</a><br/>
              Support: <a href="mailto:${esc(CONTACT_EMAIL)}" style="color:#5c4332;">${esc(CONTACT_EMAIL)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildWelcomeEmail({ name, email }) {
  const first = (name || '').trim().split(/\s+/)[0] || 'there'
  const shopUrl = `${siteBase()}/shop`
  const html = emailShell({
    title: `Welcome to ${SITE_NAME}`,
    preheader: `Welcome to ${SITE_NAME} — divine fragrance for your home.`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:18px;font-family:Georgia,serif;">Namaste ${esc(first)},</p>
      <p style="margin:0 0 14px;color:#5c4332;">
        Welcome to <strong style="color:#2b1e16;">${esc(SITE_NAME)}</strong>. Your account
        (<strong>${esc(email)}</strong>) is ready — save addresses, track orders, and enjoy smoke-free aroma for every ritual.
      </p>
      <p style="margin:0 0 22px;color:#5c4332;">
        Explore Mogra Royale, Rose Majesty, Lavender Bliss, Royal Chandan, and our Divine Ritual Kit.
      </p>
      <p style="margin:0 0 8px;text-align:center;">
        <a href="${esc(shopUrl)}" style="display:inline-block;padding:14px 28px;background:#2b1e16;color:#e4c878;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.04em;border-radius:999px;">
          Browse the shop
        </a>
      </p>
      <p style="margin:22px 0 0;color:#6b5648;font-size:13px;">
        Ghar Par Mandir Ki Feeling — thank you for joining us.
      </p>
    `,
  })

  return {
    subject: `Welcome to ${SITE_NAME}`,
    html,
  }
}

export function buildOrderEmail({ order, customer = {} }) {
  const name = order.shippingName || customer.name || 'there'
  const first = String(name).trim().split(/\s+/)[0] || 'there'
  const orderUrl = `${siteBase()}/profile/orders/${order.id || order._id}`
  const placedOn = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const rows = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(43,30,22,0.08);color:#2b1e16;">
          ${esc(item.productName)}
          <div style="font-size:12px;color:#6b5648;margin-top:2px;">Qty ${esc(item.quantity)}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(43,30,22,0.08);text-align:right;white-space:nowrap;color:#2b1e16;font-weight:600;">
          ${esc(formatINR(item.price * item.quantity))}
        </td>
      </tr>`
    )
    .join('')

  const paymentLabel =
    order.paymentMethod === 'COD'
      ? 'Cash on Delivery'
      : order.paymentMethod === 'RAZORPAY'
        ? 'Paid online'
        : esc(order.paymentMethod || '—')

  const html = emailShell({
    title: `Order ${order.orderNumber} confirmed`,
    preheader: `Your order ${order.orderNumber} is confirmed. Total ${formatINR(order.total)}.`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:18px;font-family:Georgia,serif;">Namaste ${esc(first)},</p>
      <p style="margin:0 0 14px;color:#5c4332;">
        Thank you for your order. We’ve confirmed
        <strong style="color:#2b1e16;">${esc(order.orderNumber)}</strong>
        placed on ${esc(placedOn)}.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 8px;">
        ${rows}
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;">
        <tr>
          <td style="padding:4px 0;color:#6b5648;">Subtotal</td>
          <td style="padding:4px 0;text-align:right;color:#2b1e16;">${esc(formatINR(order.subtotal))}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#6b5648;">Shipping</td>
          <td style="padding:4px 0;text-align:right;color:#2b1e16;">${order.shipping === 0 ? 'Free' : esc(formatINR(order.shipping))}</td>
        </tr>
        ${
          order.discount > 0
            ? `<tr>
          <td style="padding:4px 0;color:#1b4332;">Coupon${order.couponCode ? ` (${esc(order.couponCode)})` : ''}</td>
          <td style="padding:4px 0;text-align:right;color:#1b4332;">−${esc(formatINR(order.discount))}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding:10px 0 0;border-top:2px solid #c9a84c;font-family:Georgia,serif;font-size:18px;font-weight:600;">Total</td>
          <td style="padding:10px 0 0;border-top:2px solid #c9a84c;text-align:right;font-family:system-ui,sans-serif;font-size:18px;font-weight:700;">${esc(formatINR(order.total))}</td>
        </tr>
      </table>

      <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b5648;">Ship to</p>
      <p style="margin:0 0 14px;color:#2b1e16;line-height:1.5;">
        <strong>${esc(order.shippingName)}</strong><br/>
        ${esc(order.shippingLine1)}${order.shippingLine2 ? `<br/>${esc(order.shippingLine2)}` : ''}<br/>
        ${esc(order.shippingCity)}, ${esc(order.shippingState)} — ${esc(order.shippingPincode)}<br/>
        ${esc(order.shippingPhone)}
      </p>

      <p style="margin:0 0 22px;color:#5c4332;font-size:14px;">
        Payment: <strong style="color:#2b1e16;">${paymentLabel}</strong>
        · Status: <strong style="color:#2b1e16;">${esc(order.paymentStatus || 'PENDING')}</strong>
      </p>

      <p style="margin:0 0 8px;text-align:center;">
        <a href="${esc(orderUrl)}" style="display:inline-block;padding:14px 28px;background:#2b1e16;color:#e4c878;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.04em;border-radius:999px;">
          View order
        </a>
      </p>
      <p style="margin:22px 0 0;color:#6b5648;font-size:13px;">
        We’ll notify you as your order ships. Thank you for choosing divine fragrance for your home.
      </p>
    `,
  })

  return {
    subject: `Order confirmed · ${order.orderNumber} · ${SITE_NAME}`,
    html,
  }
}
