import { icons } from "lucide-react"

// Emoji → Lucide icon name mapping
const EMOJI_MAP: Record<string, string> = {
  "🎨": "Palette",
  "🏥": "Hospital",
  "👨‍⚕️": "UserRound",
  "🌱": "Sprout",
  "💡": "Lightbulb",
  "📖": "BookOpen",
  "⭐": "Star",
  "🦷": "Tooth",
  "🔬": "Microscope",
  "💰": "CircleDollarSign",
  "📋": "ClipboardList",
  "🏢": "Building2",
  "👤": "UserRound",
  "👥": "Users",
}

// Custom Tooth icon (not in Lucide)
function ToothIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2C9.5 2 7 4 7 7c0 2-1 4-1.5 6-.7 2.8-.5 5 .5 7 .7 1.3 1.5 2 2.5 2s1.5-1 2-2.5c.3-1 .7-1.5 1.5-1.5s1.2.5 1.5 1.5c.5 1.5 1 2.5 2 2.5s1.8-.7 2.5-2c1-2 1.2-4.2.5-7C18 11 17 9 17 7c0-3-2.5-5-5-5z" />
    </svg>
  )
}

export type IconName = string

interface IconProps {
  name: IconName | null | undefined
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function Icon({ name, size = 20, className, style }: IconProps) {
  if (!name) {
    return <span style={{ fontSize: size * 0.8, lineHeight: 1, ...style }}>?</span>
  }

  // If it's an emoji, convert to Lucide name
  const resolved = EMOJI_MAP[name] || name

  // Custom Tooth icon
  if (resolved === "Tooth") {
    return <ToothIcon size={size} className={className} />
  }

  // Look up in Lucide icons registry
  const iconKey = resolved as keyof typeof icons
  if (iconKey in icons) {
    const LucideComponent = icons[iconKey]
    return <LucideComponent size={size} className={className} style={style} />
  }

  // Fallback: render the string as-is (emoji or first char)
  return <span style={{ fontSize: size * 0.8, lineHeight: 1, ...style }}>{name}</span>
}

/** Normalize emoji to Lucide icon name */
export function normalizeIconName(input: string | null | undefined): string {
  if (!input) return "Building2"
  return EMOJI_MAP[input] || input
}
