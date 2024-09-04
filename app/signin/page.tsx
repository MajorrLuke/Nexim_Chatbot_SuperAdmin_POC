'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Section, Text } from '@radix-ui/themes';
import LoginLogo from '@/components/loginImage';
import { NeximEchoCircle1, NeximEchoCircle2 } from '@/components/neximEchoCircle';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/superAdmin');
    }
  };

  return (
    <Section className="flex items-center justify-center min-h-screen bg-gray-100 bg-white dark:bg-black">
      <form onSubmit={handleSubmit} className="flex flex-col w-[80%] sm:w-[80%] md:w-[50%] lg:w-[30%] min-h-[600px] p-8 dark:bg-neutral-950 rounded-xl shadow-md justify-center items-center relative overflow-hidden">
        <NeximEchoCircle1 className='w-[300px] h-[300px] absolute -top-20 -left-20 opacity-30'/>
        <NeximEchoCircle2 className='w-[300px] h-[300px] absolute -bottom-20 -right-[130px] opacity-30'/>
        <LoginLogo  className='justify-center mr-4 pb-4 z-1'/>
        <Text className="text-[13px] text-white">Bem vindo a Nexim</Text>
        <Text className="mb-4 text-[10px] text-white">Informe seus dados</Text>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="bg-white dark:bg-black rounded-xl p-2 mb-4 border-2 border-[#54428e] dark:border-[#0affed] text-center text-white"
        />
        <input
          type="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="bg-white dark:bg-black rounded-xl p-2 mb-4 border-2 border-[#54428e] dark:border-[#0affed] text-center"
        />
        <button type="submit" className="w-1/4 py-1 text-white dark:text-black text-sm bg-blue-500 dark:bg-[#0affed] rounded hover:bg-[#0affed]/60">
          Logar
        </button>
      </form>
    </Section>
  );
}