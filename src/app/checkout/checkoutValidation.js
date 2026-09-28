export function checkoutFieldErrors(shipping) {
  const errors = {}
  const name = String(shipping.fullName || '').trim()
  if (name.length < 2) errors.firstName = 'Enter your name.'

  const phone = String(shipping.phone || '').replace(/\D/g, '')
  if (!phone) errors.phone = 'Enter your phone number.'
  else if (phone.length < 10) errors.phone = 'Enter a 10-digit phone number.'

  if (!String(shipping.line1 || '').trim()) errors.line1 = 'Enter your address.'
  if (!String(shipping.city || '').trim()) errors.city = 'Enter your city.'
  if (!String(shipping.state || '').trim()) errors.state = 'Enter your state.'

  const pin = String(shipping.pincode || '').replace(/\D/g, '')
  if (!pin) errors.pincode = 'Enter your zip code.'
  else if (pin.length < 6) errors.pincode = 'Enter a 6-digit zip code.'

  return errors
}
