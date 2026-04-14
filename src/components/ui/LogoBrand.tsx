'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}

const sizes = {
  sm: { icon: 48, title: 'text-sm', sub: 'text-xs' },
  md: { icon: 90, title: 'text-base', sub: 'text-xs' },
  lg: { icon: 80, title: 'text-lg', sub: 'text-sm' },
}

export default function LogoBrand({ size = 'md', light = false }: LogoBrandProps) {
  const [imgError, setImgError] = useState(false)
  const s = sizes[size]

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="relative flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: s.icon, height: s.icon }}
      >
        {!imgError ? (
          <Image
            src="/logo.png"
            alt="Ilha Bella Serviços"
            fill
            className="object-contain"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          /* SVG fallback — shown until logo.png is placed in /public */
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: s.icon, height: s.icon }}>
            <circle cx="50" cy="50" r="50" fill="#1A7DC1" />
            {/* Cross divider */}
            <rect x="47" y="10" width="6" height="80" fill="white" opacity="0.6" rx="3"/>
            <rect x="10" y="47" width="80" height="6" fill="white" opacity="0.6" rx="3"/>
            {/* Plug - top left */}
            <rect x="22" y="18" width="14" height="10" rx="2" fill="white"/>
            <rect x="25" y="28" width="8" height="12" rx="2" fill="white"/>
            <line x1="29" y1="23" x2="29" y2="20" stroke="#1A7DC1" strokeWidth="2"/>
            {/* Wrench - top right */}
            <circle cx="71" cy="26" r="8" stroke="white" strokeWidth="3" fill="none"/>
            <rect x="67" y="30" width="8" height="14" rx="2" fill="white"/>
            {/* Key - bottom left */}
            <circle cx="26" cy="68" r="8" stroke="white" strokeWidth="3" fill="none"/>
            <rect x="30" y="66" width="16" height="4" rx="2" fill="white"/>
            <rect x="42" y="70" width="4" height="6" rx="1" fill="white"/>
            {/* Droplet/faucet - bottom right */}
            <path d="M72 58 L64 74 Q64 82 72 82 Q80 82 80 74 Z" fill="white"/>
          </svg>
        )}
      </span>

      <span className="leading-tight hidden xs:block">
        <span className={`block font-extrabold tracking-wide ${s.title} ${light ? 'text-white' : 'text-brand-blue'}`}>
          ILHA BELLA
        </span>
        <span className={`block font-medium ${s.sub} text-brand-gold`}>
          Serviços
        </span>
      </span>
    </span>
  )
}
