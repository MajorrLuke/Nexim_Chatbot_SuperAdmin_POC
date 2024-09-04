'use server';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "auth";

export async function signIn(provider?: string) {
  await nextAuthSignIn(provider);
}

export async function signOut() {
  await nextAuthSignOut();
}