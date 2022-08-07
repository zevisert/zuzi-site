import { Temporal, toTemporalInstant } from '@js-temporal/polyfill';
import { useRouter } from 'next/router';
import { MouseEventHandler, ReactNode } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import Stripe from 'stripe';
import useSWRInfinite from 'swr/infinite';
import { format as TimeagoFormat } from 'timeago.js';

import { toSlug } from '@/lib/to-slug';
import { Artwork } from '@/lib/types';

import NextImage from '@/components/NextImage';

import Active from './ActiveIcon';
import Button from '../buttons/Button';
import ArrowLink from '../links/ArrowLink';
import Skeleton from '../Skeleton';

declare global {
  interface Date {
    toTemporalInstant(this: Date): Temporal.Instant;
  }
}

Date.prototype.toTemporalInstant = toTemporalInstant;

const PAGE_SIZE = 10;

// A function to get the SWR key of each page,
// its return value will be accepted by `fetcher`.
// If `null` is returned, the request of that page won't start.
const getKey = (pageIndex: number, previousPageData: Stripe.ApiList<Artwork>): string | null => {
  // reached the end
  if (previousPageData && !previousPageData.data) return null;

  // first page, we don't have `previousPageData`
  if (pageIndex === 0) return `/api/artwork?limit=${PAGE_SIZE}`;

  const end = previousPageData.data.at(-1);
  // We don't have a full page to take a cursor from
  if (!end) return `/api/artwork?limit=${PAGE_SIZE}`;

  // add the cursor to the API endpoint
  return `/api/artwork?starting_after=${end.id}&limit=${PAGE_SIZE}`;
};

const fetcher = (input: RequestInfo, init?: RequestInit | undefined) =>
  fetch(input, init).then((res) => res.json());

export default function AdminArtworkTable() {
  const router = useRouter();

  const {
    data: responses,
    error,
    size,
    setSize,
  } = useSWRInfinite<Stripe.ApiList<Artwork>>(getKey, fetcher);

  const isLoadingInitialData = !responses && !error;
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && responses && typeof responses[size - 1] === 'undefined');

  const isEmpty = responses?.[0]?.data?.length === 0;

  const isReachingEnd =
    isEmpty || (responses && responses[responses.length - 1]?.data.length < PAGE_SIZE);

  const Shell = ({ children }: { children: ReactNode }) => (
    <>
      <table className='my-8 w-full table-auto border-collapse text-sm'>
        <thead>
          <tr className='whitespace-nowrap'>
            <th className='border-b pl-2 pt-0 pb-3 pr-0 text-left font-medium'>Active</th>
            <th className='w-36 border-b p-4 pt-0 pb-3 text-left font-medium'>Icon</th>
            <th className='border-b p-4 pt-0 pb-3 text-left font-medium'>Title</th>
            <th className='border-b p-4 pt-0 pb-3 text-left font-medium'>Tags</th>
            <th className='border-b p-4 pt-0 pb-3 text-left font-medium'>Posted Date</th>
            <th className='border-b p-4 pt-0 pb-3 text-left font-medium'>Last Modified</th>
            <th className='border-b p-4 pr-8 pt-0 pb-3 text-right font-medium'>
              Public Gallery Link
            </th>
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>

      <div className='float-right'>
        <Button
          variant='outline'
          disabled={isLoadingMore || size == 1}
          className='text-sm'
          onClick={() => setSize(size - 1)}
        >
          Previous Page
        </Button>
        <span className='mx-2'>Page {size}</span>
        <Button
          variant='outline'
          disabled={isLoadingMore || isReachingEnd}
          className='text-sm'
          onClick={() => setSize(size + 1)}
        >
          Next Page
        </Button>
      </div>
    </>
  );

  if (error) {
    return (
      <Shell>
        <Row
          active={<RiErrorWarningLine></RiErrorWarningLine>}
          icon={<Skeleton className='relative h-12 max-h-16' />}
          name='Error during loading'
          tags={[]}
          created={<Skeleton />}
          lastModified={<Skeleton />}
          linkItem={null}
        ></Row>
      </Shell>
    );
  }

  if (isLoadingInitialData || isLoadingMore || !responses) {
    // !responses is just to convince Typescript that it's not undefined for the next cases
    return (
      <Shell>
        {Array(PAGE_SIZE).map((_, placeholder) => (
          <Row
            key={`placeholder-${placeholder}`}
            active=''
            icon={<Skeleton className='relative h-12 max-h-16' />}
            name={<Skeleton />}
            tags={[]}
            created={<Skeleton />}
            lastModified={<Skeleton />}
            linkItem={null}
          ></Row>
        ))}
      </Shell>
    );
  }

  return (
    <Shell>
      {responses[size - 1].data.map((item) => (
        <Row
          key={item.id}
          active={<Active active={item.active} />}
          name={item.name}
          tags={item.metadata.tags}
          created={Temporal.Instant.fromEpochSeconds(
            item.created ?? Temporal.Now.instant().epochSeconds + 3600
          )
            .toZonedDateTimeISO('UTC')
            .toPlainDate()
            .toLocaleString('en-CA')}
          lastModified={TimeagoFormat(
            Temporal.Instant.fromEpochSeconds(item.updated ?? Temporal.Now.instant().epochSeconds)
              .toZonedDateTimeISO('UTC')
              .toPlainDate()
              .toString()
          )}
          linkItem={
            <ArrowLink href={`/gallery/${toSlug(item.name)}`}>{`/gallery/${toSlug(
              item.name
            )}`}</ArrowLink>
          }
          onClick={() => router.push(`/admin/edit/${toSlug(item.name)}`)}
          icon={
            <NextImage
              className='relative h-12 max-h-16'
              src={item.images[0]}
              alt={item.name}
              layout='fill'
              objectFit='cover'
              objectPosition={`center ${item.metadata.display_position ?? '50'}%`}
            ></NextImage>
          }
        ></Row>
      ))}
    </Shell>
  );
}

function Row({
  icon,
  active,
  onClick,
  name,
  tags,
  created,
  lastModified,
  linkItem,
}: {
  icon: ReactNode;
  active: ReactNode;
  onClick?: MouseEventHandler<HTMLTableRowElement>;
  name: ReactNode;
  tags: string[];
  created: ReactNode;
  lastModified: ReactNode;
  linkItem: ReactNode;
}) {
  return (
    <tr className='cursor-pointer whitespace-nowrap hover:bg-primary-100' onClick={onClick}>
      <th className='border-b p-1 text-left'>{active}</th>
      <th className='border-b p-4 py-2 text-left'>{icon}</th>
      <th className='border-b p-4 text-left text-base'>{name}</th>
      <th className='border-b p-4 text-left'>{tags.join(', ')}</th>
      <th className='border-b p-4 text-left'>{created}</th>
      <th className='border-b p-4 text-left'>{lastModified}</th>
      <th className='border-b p-4 pr-8 text-right'>{linkItem}</th>
    </tr>
  );
}
