import { Theme } from '@radix-ui/themes'; 
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import { ToastProvider } from '@/app/contexts/toastContext';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexim Super Admin",
  description:
    "Nexim Super Admin",
}

export default async function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme='dark' enableSystem={false}>
          <Theme>
            <ToastProvider>              
              <SessionProvider>
                {children}
              </SessionProvider>
            </ToastProvider>
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  )
}