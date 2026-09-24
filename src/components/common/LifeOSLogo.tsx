import React from 'react'
import { cn } from '@/lib/utils'

interface LifeOSLogoProps {
  size?: number
  className?: string
  variant?: 'badge' | 'glyph'
  showText?: boolean
  subtitle?: string
  textClassName?: string
}

export function LifeOSLogo({
  size = 36,
  className,
  variant = 'badge',
  showText = false,
  subtitle,
  textClassName,
}: LifeOSLogoProps) {
  const isBadge = variant === 'badge'

  const iconSvg = (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none transition-transform duration-300 hover:scale-105', className)}
    >
      <defs>
        {/* Deep obsidian space background */}
        <linearGradient id="lifeos-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#090a10" />
          <stop offset="50%" stopColor="#11131f" />
          <stop offset="100%" stopColor="#08090d" />
        </linearGradient>

        {/* Refined rim border */}
        <linearGradient id="lifeos-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
          <stop offset="40%" stopColor="rgba(99, 102, 241, 0.4)" />
          <stop offset="75%" stopColor="rgba(168, 85, 247, 0.25)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
        </linearGradient>

        {/* Radial atmospheric glow */}
        <radialGradient id="lifeos-core-glow" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.42" />
          <stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>

        {/* Monogram L Gradient (Cyan -> Indigo -> Violet -> Rose) */}
        <linearGradient id="lifeos-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="30%" stopColor="#6366f1" />
          <stop offset="70%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>

        {/* Ring O Gradient (Electric Violet -> Pink -> Coral) */}
        <linearGradient id="lifeos-o-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="40%" stopColor="#a855f7" />
          <stop offset="80%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>

        {/* Core Life Spark Gradient */}
        <linearGradient id="lifeos-spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>

        {/* Drop shadow */}
        <filter id="lifeos-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="22" floodColor="#6366f1" floodOpacity="0.42" />
        </filter>

        {/* Spark glow */}
        <filter id="lifeos-spark-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {isBadge && (
        <>
          {/* Squircle Rounded Container */}
          <rect
            x="16"
            y="16"
            width="480"
            height="480"
            rx="116"
            ry="116"
            fill="url(#lifeos-bg)"
            stroke="url(#lifeos-border)"
            strokeWidth="3.5"
          />

          {/* Ambient Glow Behind Elements */}
          <circle cx="256" cy="256" r="200" fill="url(#lifeos-core-glow)" />
        </>
      )}

      {/* Logo Graphics Group */}
      <g filter="url(#lifeos-shadow)">
        {/* 1. The "O" Orbital Ring */}
        <circle
          cx="286"
          cy="234"
          r="78"
          fill="none"
          stroke="url(#lifeos-o-grad)"
          strokeWidth="38"
          strokeLinecap="round"
        />

        {/* 2. The "L" Monogram */}
        <path
          d="M168 144 L168 332 C168 351.9 184.1 368 204 368 L340 368"
          fill="none"
          stroke="url(#lifeos-l-grad)"
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Central Life Spark (✦) */}
        <g filter="url(#lifeos-spark-glow)">
          <path
            d="M286 196 Q286 234 248 234 Q286 234 286 272 Q286 234 324 234 Q286 234 286 196 Z"
            fill="url(#lifeos-spark-grad)"
          />
          <circle cx="286" cy="234" r="3.5" fill="#ffffff" />
        </g>
      </g>
    </svg>
  )

  if (!showText) {
    return iconSvg
  }

  return (
    <div className="flex items-center space-x-3">
      {iconSvg}
      <div>
        <div className="flex items-center space-x-1.5">
          <span className={cn('font-bold tracking-tight text-foreground', textClassName || 'text-base')}>
            LifeOS
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
            v1.0
          </span>
        </div>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
