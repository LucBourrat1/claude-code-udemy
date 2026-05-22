'use client';

import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = { currentUser: { name: string; email: string } | null };

export default function AuthForm({ currentUser }: Props) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, [mode]);

  async function handleSignOut() {
    setLoading(true);
    await authClient.signOut();
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) {
        setError(error.message ?? 'Sign up failed');
        setLoading(false);
        return;
      }
    } else {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setError(error.message ?? 'Sign in failed');
        setLoading(false);
        return;
      }
    }

    router.push('/dashboard');
  }

  const isSignup = mode === 'signup';

  if (currentUser) {
    return (
      <div className='w-full max-w-sm px-4'>
        <div className='border rounded-xl p-8 shadow-sm space-y-6'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold'>Already signed in</h1>
            <p className='text-sm text-gray-500'>
              Signed in as <span className='font-medium text-black'>{currentUser.email}</span>
            </p>
          </div>
          <div className='space-y-3'>
            <Link
              href='/dashboard'
              className='block w-full bg-black text-white rounded-lg py-2 text-sm font-medium text-center'
            >
              Go to dashboard
            </Link>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className='w-full border rounded-lg py-2 text-sm font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
            >
              {loading ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-sm px-4'>
      <div className='border rounded-xl p-8 shadow-sm space-y-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>{isSignup ? 'Create account' : 'Welcome back'}</h1>
          <p className='text-sm text-gray-500'>
            {isSignup ? 'Sign up to start taking notes.' : 'Sign in to your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-3'>
          {isSignup && (
            <input
              type='text'
              placeholder='Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete='name'
              className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'
            />
          )}
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
            className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black'
          />

          {error && <p className='text-red-600 text-sm'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-1'
          >
            {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-500'>
          {isSignup ? 'Already have an account?' : 'No account yet?'}{' '}
          <Link
            href={isSignup ? '/authenticate?mode=signin' : '/authenticate?mode=signup'}
            className='text-black font-medium underline underline-offset-2'
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}
