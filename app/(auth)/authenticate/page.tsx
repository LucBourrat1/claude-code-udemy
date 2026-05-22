import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import AuthForm from './AuthForm';

export default async function AuthenticatePage() {
  const session = await getSession();
  const currentUser = session ? { name: session.user.name, email: session.user.email } : null;

  return (
    <main className='flex min-h-screen items-center justify-center'>
      <Suspense>
        <AuthForm currentUser={currentUser} />
      </Suspense>
    </main>
  );
}
