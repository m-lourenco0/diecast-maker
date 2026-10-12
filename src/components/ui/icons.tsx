import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps): SVGProps<SVGSVGElement> => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 20,
  height: 20,
  ...props,
})

export const IconCar = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 14.5 4.6 10c.4-1.1 1.4-1.8 2.5-1.8h9.8c1.1 0 2.1.7 2.5 1.8L21 14.5" />
    <path d="M2.5 14.5h19v3.2h-2.2M4.7 17.7H2.5v-3.2" />
    <circle cx="7" cy="17.6" r="2.1" />
    <circle cx="17" cy="17.6" r="2.1" />
  </svg>
)

export const IconPaint = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5c3.2 3.6 5.5 6.4 5.5 9.4a5.5 5.5 0 1 1-11 0c0-3 2.3-5.8 5.5-9.4Z" />
    <path d="M9.4 13.6a2.7 2.7 0 0 0 2.3 3.3" />
  </svg>
)

export const IconWheel = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M12 3.5v6.1M20.5 12h-6.1M12 20.5v-6.1M3.5 12h6.1" />
  </svg>
)

export const IconGlazing = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4.5" width="16" height="15" rx="2.2" />
    <path d="M4.5 12h15M12 4.5v15" />
  </svg>
)

export const IconAero = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 9.5h18" />
    <path d="M3 9.5c2.2 1 4.6 1.6 7 1.6h4c2.4 0 4.8-.6 7-1.6" />
    <path d="M9.5 14.5 12 9.5l2.5 5" />
    <path d="M7.5 17.5h9" />
  </svg>
)

export const IconSeat = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 4.5h5.2c1 0 1.8.8 1.8 1.8l.6 7.2" />
    <path d="M7.5 13.5h8.3c1.6 0 2.7 1 3 2.5l.4 2c.1.8-.5 1.5-1.3 1.5H9.4c-.7 0-1.3-.5-1.4-1.2L7.7 15" />
    <path d="M7.2 4.7 5.9 10" />
  </svg>
)

export const IconDoor = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5.5 19.5V7.6c0-1 .4-1.9 1.1-2.5l2.9-2.4c.5-.4 1.1-.6 1.7-.6h6.3c1 0 1.8.8 1.8 1.8v15.6" />
    <path d="M5.5 19.5h13.8" />
    <path d="M15.6 11.6v1.6" />
  </svg>
)

export const IconLid = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 16.5h11" />
    <path d="M14.5 16.5 20.5 7.5" />
    <circle cx="3.5" cy="16.5" r="1.4" />
    <path d="M6.5 20.5h11" />
  </svg>
)

export const IconRotate = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20.5 3.5v4.2h-4.2" />
  </svg>
)

export const IconShare = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5v11" />
    <path d="m8 7 4-3.5L16 7" />
    <path d="M5 12.5v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5" />
  </svg>
)

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const IconSparkle = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4.5c.7 3.6 2.4 5.3 6 6-3.6.7-5.3 2.4-6 6-.7-3.6-2.4-5.3-6-6 3.6-.7 5.3-2.4 6-6Z" />
    <path d="M18.5 15.5c.3 1.6 1 2.3 2.6 2.6-1.6.3-2.3 1-2.6 2.6-.3-1.6-1-2.3-2.6-2.6 1.6-.3 2.3-1 2.6-2.6Z" />
  </svg>
)

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12.8 4.2 4.2L19 7.2" />
  </svg>
)

export const IconReset = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12a8 8 0 1 0 2.6-5.9" />
    <path d="M3.5 3.5v4.2h4.2" />
  </svg>
)

export const IconSheet = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 3.5h9l3.5 3.5v13.5H6z" />
    <path d="M14.5 3.5V7H18M9 11h6M9 14.5h6M9 18h3.5" />
  </svg>
)

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
)

export const IconCockpit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h7A2.5 2.5 0 0 1 16 8.5" />
    <path d="M2.5 8.5h19" />
    <circle cx="9" cy="12.5" r="3" />
    <path d="M14 12.5a3 3 0 0 1 5.2 2" />
  </svg>
)

export const IconFront = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 9.5c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v6h-2.2M6.2 15.5H4v-6" />
    <path d="M7 9.5h4v3H7zM13 9.5h4v3h-4z" />
    <path d="M6.2 15.5a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 0 0-2.8 0ZM15 15.5a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 0 0-2.8 0Z" />
  </svg>
)

export const IconProfile = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 14.2c0-.6.4-1.2 1-1.4l2.4-.9 2.7-2.5c.4-.4 1-.6 1.5-.6h3.4c.6 0 1.1.3 1.5.7l2 2.3 3 .9c.6.2 1 .8 1 1.4v1.6h-2.6M6.1 15.7H3.5v-1.5" />
    <path d="M6.1 17.7a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 0 0-3.8 0ZM14.1 17.7a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 0 0-3.8 0Z" />
  </svg>
)

export const IconRear = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6.5h16l-1.2 9.5H5.2L4 6.5Z" />
    <path d="M7 10h10M8 13h8" />
  </svg>
)

export const IconTop = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 4.5h12c1.7 0 3 1.3 3 3v9c0 1.7-1.3 3-3 3H6c-1.7 0-3-1.3-3-3v-9c0-1.7 1.3-3 3-3Z" />
    <path d="M8 7h5.5L16 11.5l-2.5 6H8l-2.5-6L8 7Z" />
  </svg>
)
