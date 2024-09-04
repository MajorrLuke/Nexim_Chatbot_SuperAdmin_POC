import { NextResponse } from 'next/server'
import { auth } from "auth"

export async function middleware(request: Request) {
  const session = await auth()

  if (!session) {
    const url = new URL('/api/auth/signin', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
}
