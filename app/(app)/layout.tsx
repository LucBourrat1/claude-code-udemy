import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Header from '@/components/Header';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/authenticate');

  return (
    <>
      <Header userName={session.user.name} />
      <main className='mx-auto max-w-5xl px-4 py-8'>{children}</main>
    </>
  );
}
