import { useMemo } from 'react'
import { renderSVG } from 'uqr'

type Props = {
  value: string
  size?: number
}

/**
 * A QR code is the difference between this tool being usable and not: nobody
 * wants to type `http://192.168.68.104:1234/drop/<random key>` on a phone
 * keyboard. Rendered as inline SVG so it stays crisp and needs no canvas.
 */
export function QrCode({ value, size = 190 }: Props) {
  const svg = useMemo(
    () =>
      renderSVG(value, {
        // Light modules must be painted, not transparent: phone scanners cope
        // badly with a dark page showing through the quiet zone.
        whiteColor: '#ffffff',
        blackColor: '#000000',
        border: 2,
      }),
    [value],
  )

  return (
    <div
      className="qr"
      style={{ width: size, height: size }}
      // uqr emits a self-contained SVG string built from `value`; there is no
      // path for the input to become markup.
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label={`QR code for ${value}`}
      role="img"
    />
  )
}
