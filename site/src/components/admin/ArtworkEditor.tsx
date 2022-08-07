import { Combobox, Switch } from '@headlessui/react';
import { ReactNode, useRef } from 'react';
import { Dispatch, SetStateAction, useEffect, useReducer, useState } from 'react';
import { RiCheckFill, RiCloseCircleLine, RiFilter3Line } from 'react-icons/ri';

import clsxm from '@/lib/clsxm';
import { toSlug } from '@/lib/to-slug';
import type { Artwork, DirtyState, Price } from '@/lib/types';

import Active from '@/components/admin/ActiveIcon';
import AdminPricingTable from '@/components/admin/AdminPricingTable';
import Positioner from '@/components/admin/Positioner';
import Button from '@/components/buttons/Button';

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className='text-s inline-flex h-10 min-w-[4rem] items-center justify-around gap-1 rounded-full bg-primary-200 px-2 font-semibold leading-5 text-primary-800'>
      {children}
    </span>
  );
}

function getPath(showing: File | URL | null): string {
  if (!showing) return '';
  if (showing instanceof URL) return showing.hostname + showing.pathname;
  return showing.name;
}

function getScheme(showing: File | URL | null): string {
  if (!showing) return '://';
  if (showing instanceof URL) return `${showing.protocol}//`;
  return 'local://';
}

export default function ArtworkEditor({
  item,
  displayPosition,
  setDisplayPosition,
  image,
  setImage,
  title,
  setTitle,
  description,
  setDescription,
  active,
  setActive,
  tags,
  setTags,
  existingTags,
  initialPrices,
  prices,
  setPrices,
  onSave,
}: {
  item: Artwork;
  displayPosition: number;
  setDisplayPosition: Dispatch<SetStateAction<number>>;
  image: File | URL | null;
  setImage: Dispatch<SetStateAction<File | URL | null>>;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
  existingTags: string[];
  initialPrices: Price[];
  prices: Price[];
  setPrices: Dispatch<SetStateAction<Price[]>>;
  onSave: Dispatch<{ artwork: Artwork; changes: Partial<DirtyState> }>;
}) {
  const [galleryURL, setGalleryURL] = useState<URL>(() => {
    const url = new URL(
      item.url ?? `https://${process.env.NEXT_PUBLIC_HOSTNAME}/gallery/${toSlug(item.name)}`
    );
    url.hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    return url;
  });
  const [query, setQuery] = useState('');
  const filteredTags =
    query === ''
      ? existingTags
      : existingTags.filter((tag) => {
          return tag.toLowerCase().includes(query.toLowerCase());
        });

  const [staged, setStaged] = useState<Partial<DirtyState>>({});

  // May have updated dirty state in useEffect, force an update to
  // keep the dirty state rendered correctly if it changes
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

  // Check for changes
  useEffect(() => {
    const clean = (name: keyof DirtyState) =>
      setStaged((staged) => {
        delete staged[name];
        return staged;
      });

    const dirty = <Key extends keyof DirtyState>(name: Key, diff: DirtyState[Key]) => {
      setStaged((staged) => {
        staged[name] = diff;
        return staged;
      });
    };

    function checkDirty<Key extends keyof DirtyState>(name: Key, diff: DirtyState[Key]) {
      switch (name) {
        case 'title':
        case 'description':
        case 'active':
          if (diff?.current === diff?.actual) {
            clean(name);
          } else {
            dirty(name, diff);
          }
          break;
        case 'displayPosition':
          if ((diff?.current as number).toFixed(1) === (diff?.actual as number).toFixed(1)) {
            clean(name);
          } else {
            dirty(name, diff);
          }
          break;
        case 'tags':
        case 'prices':
          type S = Array<string | Price>;
          if (
            (diff?.current as S).every((item) => (diff?.actual as S).includes(item)) &&
            (diff?.actual as S).every((item) => (diff?.current as S).includes(item))
          ) {
            clean(name);
          } else {
            dirty(name, diff);
          }
          break;
      }
    }
    checkDirty('title', { current: title, actual: item.name });
    checkDirty('description', { current: description, actual: item.description ?? '' });
    checkDirty('active', { current: active, actual: item.active });
    checkDirty('displayPosition', {
      current: displayPosition,
      actual: item.metadata.display_position,
    });
    checkDirty('tags', { current: tags, actual: item.metadata.tags });
    checkDirty('prices', { current: prices, actual: initialPrices });
    forceUpdate();
  }, [
    title,
    item.name,
    description,
    item.description,
    active,
    item.active,
    displayPosition,
    item.metadata.display_position,
    tags,
    item.metadata.tags,
    prices,
    initialPrices,
    setStaged,
    forceUpdate,
  ]);

  function resetState() {
    setTitle(item.name);
    setDescription(item.description ?? '');
    setActive(item.active);
    setDisplayPosition(item.metadata.display_position);
    setTags([...item.metadata.tags]);
    setImage(item.images.length > 0 ? new URL(item.images[0]) : null);
    setPrices([...initialPrices]);
  }

  // Clear tag query if selected tags change
  useEffect(() => setQuery(''), [tags]);

  // Update gallery url when title changes
  useEffect(
    () => setGalleryURL(new URL(`https://zuzanariha.art/gallery/${toSlug(title)}`)),
    [title]
  );

  const form = useRef<HTMLFormElement>(null);
  return (
    <>
      <Positioner
        item={item}
        position={displayPosition}
        onChangePosition={setDisplayPosition}
        showing={image}
        onChangeShowing={setImage}
      ></Positioner>
      <form ref={form} className='relative flex flex-col gap-4 pt-4'>
        <div className='flex w-full flex-row gap-4'>
          <label className='block flex-grow'>
            <span className='text-gray-700'>Title</span>
            <input
              type='text'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm invalid:border-red-500 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 invalid:focus:ring-red-500'
              placeholder="Artwork title. This value is required and is used to define the link to it's gallery page."
              minLength={1}
              required
              value={title}
              onChange={(evt) => setTitle(evt.target.value)}
            />
          </label>
          <Button
            className='float-right h-10 self-end disabled:bg-transparent'
            variant='ghost'
            onClick={() => resetState()}
            disabled={Object.keys(staged).length === 0}
          >
            Undo Changes
          </Button>
          <Button
            className='float-right h-10 self-end'
            onClick={() => onSave({ artwork: item, changes: staged })}
            disabled={!form.current?.checkValidity() || Object.keys(staged).length === 0}
          >
            Save Changes
          </Button>
        </div>
        <label className='block'>
          <span className='text-gray-700'>Description</span>
          <textarea
            className='mt-1 block min-h-[3rem] w-full min-w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50'
            placeholder='Description Text'
            value={description}
            onChange={(evt) => setDescription(evt.target.value)}
          />
        </label>
        <div className='flex w-full flex-row gap-8'>
          <div className='block cursor-pointer select-none'>
            <Switch.Group>
              <Switch.Label className='block'>Show in Gallery</Switch.Label>
              <Switch
                checked={active}
                onChange={setActive}
                className={clsxm(
                  active ? 'bg-primary-200' : 'bg-primary-100',
                  'relative',
                  'inline-flex',
                  'mt-1',
                  'h-10',
                  'w-16',
                  'shrink-0',
                  'cursor-pointer',
                  'rounded-full',
                  'border-2',
                  'border-transparent',
                  'transition-colors',
                  'duration-200',
                  'ease-in-out',
                  'focus:outline-none',
                  'focus:ring',
                  'focus:ring-primary-200',
                  'focus:ring-opacity-50'
                )}
              >
                <span
                  aria-hidden='true'
                  className={clsxm(
                    active ? 'translate-x-6' : 'translate-x-0',
                    'pointer-events-none',
                    'flex',
                    'h-9',
                    'w-9',
                    'transform',
                    'justify-center',
                    'rounded-full',
                    'bg-white',
                    'items-center',
                    'shadow-lg',
                    'ring-0',
                    'transition',
                    'duration-200',
                    'ease-in-out'
                  )}
                >
                  <Active active={active} />
                </span>
              </Switch>
            </Switch.Group>
          </div>
          <div className='select-none'>
            <label htmlFor='vertical-position' className='block text-gray-700'>
              Preview Vertical Position
            </label>
            <div className='mt-1 flex rounded-md shadow-sm focus-within:border-primary-300 focus-within:ring focus-within:ring-primary-200 focus-within:ring-opacity-50'>
              <input
                type='number'
                name='vertical-position'
                id='vertical-position'
                className='block w-full rounded-none rounded-l-md border-gray-300 focus:border-primary-300 focus:ring-0 disabled:bg-primary-100'
                placeholder='Height'
                min='0'
                value={displayPosition}
                disabled
                readOnly
              />
              <span className='inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-primary-200 px-3 text-sm text-primary-500'>
                %
              </span>
            </div>
          </div>
          <label className='select-none'>
            <span className='text-gray-700'>Tags</span>
            <div className='mt-1 flex flex-wrap gap-4'>
              {tags.map((tag) => (
                <Chip key={tag}>
                  {tag}
                  <RiCloseCircleLine
                    className='h-5 w-5 cursor-pointer'
                    onClick={() => setTags((selected) => selected.filter((el) => el !== tag))}
                  ></RiCloseCircleLine>
                </Chip>
              ))}
            </div>
          </label>
        </div>
        <label className='block'>
          <span className='text-gray-700'>Tags</span>
          <Combobox value={tags} onChange={setTags} multiple>
            <div className='relative w-full cursor-default  '>
              <Combobox.Input
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50'
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Create and search for tags'
              />
              <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
                <RiFilter3Line className='h-5 w-5 text-gray-400' aria-hidden='true' />
              </Combobox.Button>
            </div>
            <div className=''>
              <Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                {query.length > 0 && (
                  <Combobox.Option
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={query}
                  >{`Create "${query}"`}</Combobox.Option>
                )}
                {Array.from(new Set([...filteredTags, ...tags])).map((tag: string) => (
                  <Combobox.Option
                    key={tag}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={tag}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                        >
                          {tag}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-primary-600'
                            }`}
                          >
                            <RiCheckFill className='h-5 w-5' aria-hidden='true' />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </label>
        <div className='flex flex-grow flex-row gap-4'>
          <div className='w-full'>
            <label htmlFor='image-file-location' className='block text-gray-700'>
              Image Location
            </label>
            <div className='mt-1 flex select-all rounded-md shadow-sm'>
              <span className='inline-flex items-center rounded-l-md border border-r-0 border-primary-300 bg-primary-200 px-3  text-primary-500'>
                {getScheme(image)}
              </span>
              <input
                type='text'
                name='image-file-location'
                id='image-file-location'
                disabled
                className='block w-full flex-1 rounded-none rounded-r-md border-primary-300 bg-primary-100 focus:border-primary-500 focus:ring-primary-500 '
                placeholder='Filename or URL'
                value={getPath(image)}
              />
            </div>
          </div>
          <div className='w-full'>
            <label htmlFor='gallery-url' className='block text-gray-700'>
              Gallery URL
            </label>
            <div className='mt-1 flex select-all rounded-md shadow-sm'>
              <span className='inline-flex items-center rounded-l-md border border-r-0 border-primary-300 bg-primary-200 px-3  text-primary-500'>
                https://
              </span>
              <input
                type='text'
                name='gallery-url'
                id='gallery-url'
                disabled
                className='block w-full flex-1 rounded-none rounded-r-md border-primary-300 bg-primary-100 focus:border-primary-500 focus:ring-primary-500 '
                placeholder='Filename or URL'
                value={getPath(galleryURL)}
              />
            </div>
          </div>
        </div>
      </form>
      <AdminPricingTable
        className='relative pt-4'
        product={item}
        prices={prices}
        onChangePrices={setPrices}
      ></AdminPricingTable>
      <pre>{JSON.stringify(staged, null, 2)}</pre>
    </>
  );
}
