'use client';

import { Button } from "@radix-ui/themes";
import { useRouter } from 'next/navigation';
import { signIn, signOut } from "@/app/actions/auth";

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  const router = useRouter();

  const handleSignIn = async () => {
    await signIn(provider);
    router.refresh();
  };

  return (
    <Button 
      onClick={handleSignIn}
      className="cursor-pointer text-center"
      {...props}
    >
      Sign In
    </Button>
  );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <Button 
      onClick={handleSignOut}
      variant="ghost" 
      className="w-full p-0 cursor-pointer text-center" 
      {...props}
    >
      Sign Out
    </Button>
  );
}