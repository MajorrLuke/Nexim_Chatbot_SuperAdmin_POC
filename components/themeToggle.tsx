'use client';

import { useTheme } from 'next-themes';
import { Button } from '@radix-ui/themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!theme) {
      setTheme('dark');
    }
  }, [theme, setTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      className={`bg-transparent cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-black'}`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? <SunIcon fontSize={24} /> : <MoonIcon fontSize={24} />}
    </Button>
  );
}