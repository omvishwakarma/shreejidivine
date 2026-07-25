import { CONTACT_EMAIL, SITE_NAME, SITE_URL, SITE_TAGLINE } from './site'
import { formatINR } from './products'

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function resolveLogoSrc() {
  const fallback =
    typeof window !== 'undefined'
      ? `${window.location.origin}/images/logo.png`
      : `${SITE_URL}/images/logo.png`

  if (typeof window === 'undefined') return fallback

  try {
    const res = await fetch('/images/logo.png')
    if (!res.ok) return fallback
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return fallback
  }
}

export function buildInvoiceHtml(order, customer = {}, { logoSrc } = {}) {
  const placedOn = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const logo =
    logoSrc ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/images/logo.png`
      : `${SITE_URL}/images/logo.png`)

  const rows = (order.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${esc(item.productName)}</strong>
          ${item.productSlug ? `<div class="muted">${esc(item.productSlug)}</div>` : ''}
        </td>
        <td class="num">${esc(formatINR(item.price))}</td>
        <td class="num">${esc(item.quantity)}</td>
        <td class="num">${esc(formatINR(item.price * item.quantity))}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${esc(order.orderNumber)} · ${SITE_NAME}</title>
  <style>
    :root {
      --brown: #2b1e16;
      --gold: #c9a84c;
      --muted: #6b5648;
      --line: rgba(43,30,22,0.12);
      --bg: #faf6f0;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--brown);
      background: #fff;
    }
    .sheet { max-width: 800px; margin: 0 auto; }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--gold);
      margin-bottom: 24px;
    }
    .brand-block {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .brand { font-size: 28px; letter-spacing: 0.08em; }
    .brand small { display: block; margin-top: 6px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); font-family: system-ui, sans-serif; }
    .invoice-meta { text-align: right; font-family: system-ui, sans-serif; font-size: 13px; color: var(--muted); }
    .invoice-meta strong { display: block; color: var(--brown); font-size: 18px; margin-bottom: 6px; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
    }
    .label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-family: system-ui, sans-serif; font-size: 14px; }
    th { text-align: left; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); padding: 10px 8px; border-bottom: 1px solid var(--line); }
    td { padding: 12px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
    .num { text-align: right; white-space: nowrap; }
    .muted { color: var(--muted); font-size: 12px; margin-top: 4px; }
    .totals { margin-top: 18px; margin-left: auto; width: min(280px, 100%); font-family: system-ui, sans-serif; font-size: 14px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals .grand { margin-top: 8px; padding-top: 10px; border-top: 2px solid var(--gold); font-size: 18px; font-weight: 700; font-family: Georgia, serif; }
    .foot { margin-top: 36px; padding-top: 16px; border-top: 1px solid var(--line); font-family: system-ui, sans-serif; font-size: 12px; color: var(--muted); }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div class="brand-block">
        <img class="logo" src="${esc(logo)}" alt="${esc(SITE_NAME)}" />
        <div class="brand">${SITE_NAME}<small>${SITE_TAGLINE}</small></div>
      </div>
      <div class="invoice-meta">
        <strong>TAX INVOICE</strong>
        Invoice No: ${esc(order.orderNumber)}<br/>
        Date: ${esc(placedOn)}<br/>
        Status: ${esc(order.status)} · ${esc(order.paymentMethod)} · ${esc(order.paymentStatus || 'PENDING')}
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="label">Bill To</div>
        <div><strong>${esc(order.shippingName)}</strong></div>
        <div>${esc(customer.email || '')}</div>
        <div>${esc(order.shippingPhone)}</div>
      </div>
      <div>
        <div class="label">Ship To</div>
        <div>${esc(order.shippingLine1)}</div>
        ${order.shippingLine2 ? `<div>${esc(order.shippingLine2)}</div>` : ''}
        <div>${esc(order.shippingCity)}, ${esc(order.shippingState)} — ${esc(order.shippingPincode)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th class="num">Price</th>
          <th class="num">Qty</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div><span>Subtotal</span><span>${esc(formatINR(order.subtotal))}</span></div>
      <div><span>Shipping</span><span>${order.shipping === 0 ? 'Free' : esc(formatINR(order.shipping))}</span></div>
      ${
        order.discount > 0
          ? `<div><span>Coupon${order.couponCode ? ` (${esc(order.couponCode)})` : ''}</span><span>−${esc(formatINR(order.discount))}</span></div>`
          : ''
      }
      <div class="grand"><span>Total</span><span>${esc(formatINR(order.total))}</span></div>
    </div>

    ${
      order.razorpayPaymentId
        ? `<div class="foot">Payment Ref (Razorpay): ${esc(order.razorpayPaymentId)}</div>`
        : ''
    }
    ${order.notes ? `<div class="foot">Notes: ${esc(order.notes)}</div>` : ''}

    <div class="foot">
      ${SITE_NAME} · ${SITE_URL}<br/>
      Support: ${CONTACT_EMAIL}<br/>
      Thank you for choosing divine fragrance for your home.
    </div>
  </div>
</body>
</html>`
}

function waitForImages(doc) {
  const images = [...doc.images]
  if (!images.length) return Promise.resolve()
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
    )
  )
}

export async function downloadInvoice(order, customer = {}) {
  const logoSrc = await resolveLogoSrc()
  const html = buildInvoiceHtml(order, customer, { logoSrc })

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:0;opacity:0;pointer-events:none;'
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    doc.open()
    doc.write(html)
    doc.close()
    await waitForImages(doc)

    const canvas = await html2canvas(doc.body, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * pageWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`Invoice-${order.orderNumber || 'order'}.pdf`)
  } finally {
    iframe.remove()
  }
}

export async function printInvoice(order, customer = {}) {
  const logoSrc = await resolveLogoSrc()
  const html = buildInvoiceHtml(order, customer, { logoSrc })
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1000')
  if (!win) {
    await downloadInvoice(order, customer)
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
  }, 350)
}
