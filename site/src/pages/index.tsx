import { PrismaClient } from '@prisma/client';
import { InferGetServerSidePropsType } from 'next';
import * as React from 'react';

import NextImage from '@/components/NextImage';
import Seo from '@/components/Seo';

import AboutBg from '~/images/about-bg.jpg';

export const getServerSideProps = async () => {
  const prisma = new PrismaClient();
  const about = await prisma.about.findMany();
  return {
    props: {
      about: { lines: about.sort((a, b) => a.order - b.order).map((item) => item.text) },
    },
    revalidate: 600,
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
          <NextImage src={AboutBg}></NextImage>
          {about.lines.map((line, i) => (
            <p key={i} className='mb-3 px-5 text-lg'>
              {line}
            </p>
          ))}
        </section>
      </main>
    </>
  );
}
