import Image from 'next/image'
import './BrandLogo.css'

/** Transparent logo — visible on light sticky header with no logo background. */
export default function BrandLogo({
  className = '',
  height = 48,
  priority = false,
}) {
  const width = Math.round((height * 516) / 358)

  return (
    <span className={`brand-logo ${className}`.trim()} style={{ height, width }}>
      <Image
        src="/images/logo-transparent.png"
        alt="Shreeji Divine"
        width={516}
        height={358}
        priority={priority}
        className="brand-logo__img"
        sizes={`${width}px`}
      />
    </span>
  )
}
