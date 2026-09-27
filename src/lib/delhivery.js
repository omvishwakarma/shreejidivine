function env(name) {
  return (process.env[name] || '').trim()
}

export function delhiveryConfig() {
  const token = env('DELHIVERY_API_TOKEN')
  const pickupName = env('DELHIVERY_PICKUP_NAME')
  const mode = env('DELHIVERY_ENV').toLowerCase()
  const staging = mode === 'staging' || mode === 'test'
  return {
    token,
    pickupName,
    staging,
    baseUrl: staging ? 'https://staging-express.delhivery.com' : 'https://track.delhivery.com',
    configured: Boolean(token && pickupName),
  }
}

function clean(value, max = 200) {
  return String(value || '')
    .replace(/[&#%\\;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function phone10(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.slice(-10)
}

async function delhiveryFetch(path, options = {}) {
  const { token, baseUrl, configured } = delhiveryConfig()
  if (!configured) {
    throw new Error(
      'Delhivery is not configured. Add DELHIVERY_API_TOKEN and DELHIVERY_PICKUP_NAME.'
    )
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Token ${token}`,
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!response.ok) {
    const message =
      data?.error ||
      data?.rmk ||
      data?.message ||
      (typeof data?.raw === 'string' && data.raw.slice(0, 180)) ||
      `Delhivery request failed (${response.status})`
    throw new Error(message)
  }
  return data
}

export async function createDelhiveryShipment(order) {
  const { pickupName } = delhiveryConfig()
  const pin = String(order.shippingPincode || '').replace(/\D/g, '').slice(0, 6)
  const phone = phone10(order.shippingPhone)
  const address = clean([order.shippingLine1, order.shippingLine2].filter(Boolean).join(', '), 250)
  if (pin.length !== 6) throw new Error('A 6-digit delivery pincode is required.')
  if (phone.length !== 10) throw new Error('A 10-digit delivery phone is required.')
  if (!address) throw new Error('A delivery address is required.')

  const isCod = order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID'
  const quantity = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 1
  const products = clean(
    (order.items || [])
      .map((item) => `${item.productName || 'Item'} x${item.quantity || 1}`)
      .join(', '),
    200
  )
  const shipment = {
    name: clean(order.shippingName, 100),
    add: address,
    pin,
    city: clean(order.shippingCity, 50),
    state: clean(order.shippingState, 50),
    country: 'India',
    phone,
    order: clean(order.orderNumber, 40),
    payment_mode: isCod ? 'COD' : 'Pre-paid',
    cod_amount: isCod ? String(Math.round(Number(order.total) || 0)) : '0',
    total_amount: String(Math.round(Number(order.total) || 0)),
    products_desc: products || 'Shreeji Divine order',
    quantity: String(quantity),
    weight: env('DELHIVERY_PACKAGE_WEIGHT') || '500',
    shipment_length: env('DELHIVERY_LENGTH_CM') || '15',
    shipment_width: env('DELHIVERY_WIDTH_CM') || '10',
    shipment_height: env('DELHIVERY_HEIGHT_CM') || '10',
    seller_name: 'Shreeji Divine',
    seller_inv: clean(order.orderNumber, 40),
  }
  const gst = env('DELHIVERY_SELLER_GST')
  const hsn = env('DELHIVERY_HSN_CODE')
  if (gst) shipment.seller_gst_tin = gst
  if (hsn) shipment.hsn_code = hsn

  const payload = {
    shipments: [shipment],
    pickup_location: { name: pickupName },
  }
  const body = new URLSearchParams()
  body.set('format', 'json')
  body.set('data', JSON.stringify(payload))

  const data = await delhiveryFetch('/api/cmu/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const pkg = data?.packages?.[0]
  const remarks = Array.isArray(pkg?.remarks) ? pkg.remarks.filter(Boolean).join(', ') : ''
  if (!pkg || String(pkg.status || '').toLowerCase() !== 'success' || !pkg.waybill) {
    throw new Error(remarks || data?.rmk || data?.error || 'Delhivery could not create the shipment')
  }

  return {
    waybill: String(pkg.waybill),
    sortCode: pkg.sort_code || '',
    status: pkg.status || 'Success',
    remarks,
  }
}

export async function trackDelhiveryShipment(waybill) {
  const { token } = delhiveryConfig()
  const data = await delhiveryFetch(
    `/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}&token=${encodeURIComponent(token)}`
  )
  const shipment = data?.ShipmentData?.[0]?.Shipment
  const status = shipment?.Status?.Status || ''
  const scans = (shipment?.Scans || [])
    .map((entry) => entry?.ScanDetail)
    .filter(Boolean)
    .slice(-5)
    .reverse()
    .map((scan) => ({
      status: scan.Scan || '',
      instructions: scan.Instructions || '',
      location: scan.ScannedLocation || '',
      at: scan.ScanDateTime || '',
    }))
  return { status, scans }
}

export async function delhiveryLabelUrl(waybill) {
  const data = await delhiveryFetch(
    `/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true`
  )
  const link = data?.packages?.[0]?.pdf_download_link || ''
  if (!link) throw new Error('Shipping label is not ready yet.')
  return link
}
