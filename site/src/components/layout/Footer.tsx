import * as React from 'react';

import UnderlineLink from '@/components/links/UnderlineLink';

export default function Footer() {
  return (
    <footer className='clear-both mt-auto w-full text-gray-700'>
      <div className='layout flex flex-row items-center justify-center gap-1 text-center'>
        © {new Date().getFullYear()} Zuzana Riha. Website by
        <UnderlineLink href='https://zevisert.ca'>Zev Isert</UnderlineLink>
      </div>
    </footer>
  );
}
