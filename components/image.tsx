'use client'
import { useTheme } from 'next-themes'
import Link from 'next/link';
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
  href = '/dashboard' 
}: ThemeLogoProps) {
  const { theme } = useTheme()

  const logoSrc = theme === 'light' 
    ? "/logo_horizontal_purple.png" 
    : "/logo_horizontal.png";

  return (
    <Link 
      href={href} 
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
    </Link>
  )
}