'use client'
import { useTheme } from 'next-themes'
import Image from 'next/image';

interface ThemeLogoProps {
  className?: string;
  width?: number;
  height?: number;
  href?: string;
}

export default function ThemeLogo({ 
  className = '', 
  width = 130, 
  height = 130, 
}: ThemeLogoProps) {
  const { theme } = useTheme()

  const logoSrc = theme === 'light' 
    ? "/images/logo_horizontal_purple.png" 
    : "/images/logo_horizontal.png";

  return (
    <div 
      className={`flex items-center justify-start ${className} ml-4`}
    >
      <Image 
        src={logoSrc}
        alt="logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  )
}