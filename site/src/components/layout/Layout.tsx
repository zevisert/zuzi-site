import * as React from 'react';

import Footer from './Footer';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Put Header or Footer Here
  return (
    <div className='flex min-h-screen flex-col justify-start'>
      <Header />
      <main className='mx-auto w-full max-w-5xl px-5 sm:px-3 lg:px-0'>{children}</main>
      <Footer />
    </div>
  );
}
