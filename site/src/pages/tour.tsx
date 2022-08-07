import * as React from 'react';

import Seo from '@/components/Seo';

export default function TourPage() {
  return (
    <>
      <Seo templateTitle='Virtual Gallery Tour'></Seo>
      <section>
        <article className='mx-0 my-auto flex h-auto max-w-7xl flex-col overflow-hidden p-0'>
          <iframe
            className='h-[80vh] w-full overflow-hidden'
            width='100%'
            height='100%'
            src='https://my.matterport.com/show/?m=A8HFnGeF8Vz'
            frameBorder='0'
            allowFullScreen
            allow='xr-spatial-tracking'
          ></iframe>
          <span className='relative border-b-2 border-primary-500 pt-4 text-xl'>
            November 2020 Art Show
          </span>
          <blockquote>Tour my latest art showing in 3D</blockquote>
        </article>
      </section>
    </>
  );
}
