import Image from 'next/image'
import './BrandLogo.css'

const LOGO_W = 969
const LOGO_H = 747

/** Gold logo on transparent — visible on the light sticky header. */
export default function BrandLogo({
  className = '',
  height = 56,
  priority = false,
}) {
  const width = Math.round((height * LOGO_W) / LOGO_H)

  return (
    <span className={`brand-logo ${className}`.trim()} style={{ height, width }}>
      <Image
        src="/images/logo-transparent.png"
        alt="Shreeji Divine"
        width={LOGO_W}
        height={LOGO_H}
        priority={priority}
        className="brand-logo__img"
        sizes={`${width}px`}
      />
    </span>
  )
}
