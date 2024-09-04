'use client'
import { useTheme } from 'next-themes'
import Image from 'next/image';

interface LoginLogoProps {
  className?: string;
  width?: number;
  height?: number;
  href?: string;
}

export default function LoginLogo({ 
  className = '', 
  width = 100, 
  height = 100, 
}: LoginLogoProps) {
  const { theme } = useTheme()

  const logoSrc = theme === 'light' 
    ? "/images/login_logo_purple.png" 
    : "/images/login_logo_white.png";

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