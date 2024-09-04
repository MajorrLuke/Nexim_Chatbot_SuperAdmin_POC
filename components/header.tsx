import UserButton from "./user-button"
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ThemeProvider } from 'next-themes'
import ThemeToggle from './themeToggle'
import ThemeLogo from './image'
import React from "react"

export default function Header() {

  return (
    <ThemeProvider>
      <header className="absolute border-b border-[#0affed] w-full text-sm z-1000 bg-white dark:bg-black">
        <div className="flex items-center w-full h-16">
          <div className="w-1/4 flex-shrink-0">
            <ThemeLogo />
          </div>
          <NavigationMenu.Root className="w-1/2 flex justify-center">
            <NavigationMenu.List className="flex space-x-2">
              {/* Trigger.map((trigger, index) => (
                <NavigationMenu.Item key={index}>
                  {trigger.items ? (
                    <>
                      <NavigationMenu.Trigger className="px-3 py-2 text-sm font-medium text-[#54428e] dark:text-white hover:text-[#0affed] dark:hover:text-[#0affed] transition-colors">
                        {trigger.label}
                      </NavigationMenu.Trigger>
                      <NavigationMenu.Content>
                        <ul className="absolute bg-transparent backdrop-blur-md shadow-lg rounded-md overflow-hidden w-48 border border-zinc-800">
                          {trigger.items.map((item, index) => (
                            <React.Fragment key={index}>
                              <li>
                                <Link href={item.href} className="block px-4 py-2 text-sm font-medium text-[#54428e] dark:text-white hover:text-[#0affed] dark:hover:text-[#0affed] transition-colors">
                                  {item.label}
                                </Link>
                              </li>
                              {index < trigger.items.length - 1 && (
                                <Separator size="4" orientation="horizontal" />
                              )}
                            </React.Fragment>
                          ))}
                        </ul>
                      </NavigationMenu.Content>
                    </>
                  ) : (
                    <Link href={trigger.href} className="flex items-center px-3 py-2 text-sm font-medium text-[#54428e] dark:text-white hover:text-[#0affed] dark:hover:text-[#0affed] transition-colors">
                      {trigger.label}
                    </Link>
                  )}
                </NavigationMenu.Item>
              ))} */}
            </NavigationMenu.List>
          </NavigationMenu.Root>
          <div className="w-1/4 flex justify-end items-center space-x-2">
            <UserButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
    </ThemeProvider>
  )
}