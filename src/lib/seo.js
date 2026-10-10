export function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function clipText(value, max = 155) {
  const clean = plainText(value)
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > 80 ? cut.slice(0, space) : cut).replace(/[.,;:\s]+$/, '')}…`
}
