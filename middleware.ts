import { NextResponse } from 'next/server'
import { auth } from "auth"

export async function middleware(request: Request) {
  const session = await auth()
  const { pathname } = new URL(request.url)


  // Redirect to signin if not authenticated and trying to access a protected route
  if (!session) {
    const signinUrl = new URL('/signin', request.url)
    signinUrl.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

// Update the matcher to include all routes except signin, public assets, and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|signin|public|images/).*)"],
}
