import * as React from "react"

function SvgWrap({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  )
}

export function SunIcon() {
  return (
    // <SvgWrap>
    //   <circle cx="12" cy="12" r="4.2" />
    //   <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.2 2.2M16.6 16.6l2.2 2.2M18.8 5.2l-2.2 2.2M7.4 16.6l-2.2 2.2" />
    // </SvgWrap>
    <img src="/images/icons/sun.svg" alt="sun" className="size-full" />
  )
}

export function CloudIcon() {
  return (
    <SvgWrap>
      <path d="M7 18h9a4 4 0 0 0 .2-8 5.4 5.4 0 0 0-10.5 1.4A3.5 3.5 0 0 0 7 18Z" />
    </SvgWrap>
    // <img src="/images/icons/cloud.svg" alt="cloud" className="size-full" />
  )
}

export function RainIcon() {
  return (
    <SvgWrap>
      <path d="M7 14h9a4 4 0 0 0 .2-8 5.4 5.4 0 0 0-10.5 1.4A3.5 3.5 0 0 0 7 14Z" />
      <path d="M9 16.5l-1 2.2M13 16.5l-1 2.2M17 16.5l-1 2.2" />
    </SvgWrap>
    // <img src="/images/icons/rain.svg" alt="rain" className="size-full" />
  )
}

export function SnowIcon() {
  return (
    <SvgWrap>
      <path d="M7 13h9a4 4 0 0 0 .2-8 5.4 5.4 0 0 0-10.5 1.4A3.5 3.5 0 0 0 7 13Z" />
      <path d="M9 16.5h.01M13 18h.01M17 16.5h.01" />
    </SvgWrap>
  )
}

export function FogIcon() {
  return (
    <SvgWrap>
      <path d="M4 10h16M3 14h18M5 18h14" />
    </SvgWrap>
    // <img src="/images/icons/fog.svg" alt="fog" className="size-full" />
  )
}

export function getWeatherIconByCode(code: number): React.ReactNode {
  if ([0].includes(code)) return <SunIcon />
  if ([45, 48].includes(code)) return <FogIcon />
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return <RainIcon />
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <SnowIcon />
  return <CloudIcon />
}
