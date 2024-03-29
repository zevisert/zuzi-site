import { PrismaClient } from '@prisma/client';
import { InferGetServerSidePropsType } from 'next';

import ArrowLink from '@/components/links/ArrowLink';
import NextImage from '@/components/NextImage';
import Seo from '@/components/Seo';

import AboutBg from '~/images/about-bg.jpg';

const prisma = new PrismaClient();

export const getServerSideProps = async () => {
  const about = await prisma.about.findMany();
  return {
    props: {
      about: { lines: about.sort((a, b) => a.order - b.order).map((item) => item.text) },
    },
  };
};

export default function HomePage({
  about,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Seo templateTitle='About' />
      <main>
        <section className='min-h-screen bg-white'>
          <div className='layout flex flex-col items-center justify-center text-center'>
            <h1 className='font-syncopate'>Welcome to Zuzana Riha Art</h1>
          </div>
          <NextImage
            src={AboutBg}
            alt='A picture of Zuzana Riha with her sculpture and artwork.'
          ></NextImage>
          {about.lines.map((line, i) => (
            <p key={i} className='mb-3 px-5 text-lg'>
              {line}
            </p>
          ))}
          <hr />
          <div className='flex flex-col items-center justify-around pt-4'>
            <span>
              Browse through the{' '}
              <ArrowLink direction='right' href='/gallery'>
                Gallery
              </ArrowLink>{' '}
              to see if you like anything I&apos;ve made!
            </span>
          </div>
        </section>
      </main>
    </>
  );
}
