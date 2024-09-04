'use client'

import { useEffect, useState } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Button, Flex, Separator } from "@radix-ui/themes"
import { SignOut } from "./auth-components"
import { Avatar } from "@radix-ui/themes"
import { useSession } from "next-auth/react"

export default function UserButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="hidden text-sm sm:inline-flex">
              {session.user.name}
            </span>
            <Button className="relative w-8 h-8 rounded-full p-0 bg-transparent">
              <Avatar src={session.user.image} size="1" radius="large" fallback="A" />
            </Button>
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="absolute -ml-16 bg-transparent backdrop-blur-md shadow-lg rounded-md overflow-hidden w-46 transition-all duration-200 ease-in-out border border-gray-200/50 dark:border-gray-700/50" align="start">
            <DropdownMenu.Label className="p-2 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenu.Label>
            <DropdownMenu.Item className="p-2 bg-red-500 hover:bg-red-600 rounded-sm transition-colors duration-150 cursor-pointer border-b border-gray-200/50 dark:border-gray-700/50">
              <SignOut />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  )
}