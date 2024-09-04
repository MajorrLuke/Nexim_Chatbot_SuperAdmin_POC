import { Theme } from '@radix-ui/themes'; 
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { ToastProvider } from '@/app/contexts/toastContext';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexim Chatbot",
  description:
    "Nexim Chatbot",
}

export default async function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme='dark' enableSystem={false}>
          <Theme>
            <ToastProvider>
              <div className="flex flex-col justify-between w-full h-full min-h-screen">
                <Header />
                <main className="flex-auto w-full h-full px-4 py-4 mx-auto sm:px-6 md:py-6">
                  <SessionProvider>
                    {children}
                  </SessionProvider>
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  )
}