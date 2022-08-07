import type { GetServerSideProps } from 'next';
import { InferGetServerSidePropsType } from 'next';
import { DefaultSession } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';

import useHasMounted from '@/lib/useHasMounted';

import AdminArtworkTable from '@/components/admin/ArtworkTable';

type AdminServerSideProps = {
  session: DefaultSession;
};

export const getServerSideProps: GetServerSideProps<AdminServerSideProps> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=${context.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default function Admin(_props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const hasMounted = useHasMounted();
  const { data: session } = useSession();

  if (!hasMounted) return null;

  if (!session) {
    return <p>Access Denied</p>;
  }

  return <AdminArtworkTable></AdminArtworkTable>;
}
