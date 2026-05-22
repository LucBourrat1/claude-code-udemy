import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6'>
      <h1 className='text-4xl font-bold'>Welcome to Notes</h1>
      <p className='text-gray-500'>Create, edit, and share rich-text notes.</p>
      <nav className='flex flex-col items-center gap-2'>
        <Link href='/authenticate' className='text-blue-600 hover:underline'>
          Sign in / Register
        </Link>
        <Link href='/dashboard' className='text-blue-600 hover:underline'>
          Dashboard
        </Link>
        <Link href='/notes/demo' className='text-blue-600 hover:underline'>
          Note editor (demo)
        </Link>
        <Link href='/p/demo' className='text-blue-600 hover:underline'>
          Public note (demo)
        </Link>
      </nav>
    </div>
  );
}
