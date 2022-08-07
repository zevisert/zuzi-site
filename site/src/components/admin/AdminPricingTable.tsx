import { Switch } from '@headlessui/react';
import { BaseHTMLAttributes, Dispatch, ReactNode, SetStateAction, useRef, useState } from 'react';
import { RiQuestionLine } from 'react-icons/ri';

import clsxm from '@/lib/clsxm';
import { Artwork, EPHEMERAL_ID, Price, SingleCartItem } from '@/lib/types';

import Button from '@/components/buttons/Button';
import PriceDisplay from '@/components/Price';

export default function PricingTable({
  product,
  prices,
  onChangePrices,
  ...rest
}: {
  product: Artwork;
  prices: Price[];
  onChangePrices: Dispatch<SetStateAction<Price[]>>;
} & BaseHTMLAttributes<HTMLElement>) {
  const [unitAmount, setUnitAmount] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [sizeUnit, setSizeUnit] = useState<'in' | 'cm'>('in');
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [depth, setDepth] = useState<number | undefined>(undefined);

  function addPrice(): void {
    const price = SingleCartItem.parse({
      active: true,
      currency: 'CAD',
      product: product.id,
      type: 'one_time',
      unit_amount: Math.round((unitAmount ?? 0) * 100),
      metadata: {
        medium: title,
        unit: sizeUnit,
        width: width?.toString(),
        height: height?.toString(),
        depth: depth?.toString(),
      },
    });

    setUnitAmount(undefined);
    setTitle(undefined);
    setSizeUnit('in');
    setWidth(undefined);
    setHeight(undefined);
    setDepth(undefined);

    onChangePrices((prices) => [price, ...prices]);
  }

  function removePrice(price: Price): void {
    onChangePrices((prices) => {
      const match = prices.findIndex((p) => p === price);
      if (match !== -1) {
        if (prices[match].id === EPHEMERAL_ID) {
          prices[match] = { ...price, active: !price.active };
        } else {
          prices.splice(match, 1);
        }
      }
      return [...prices];
    });
  }

  if (!prices)
    return (
      <Shell
        unitAmount={unitAmount}
        setUnitAmount={setUnitAmount}
        title={title}
        setTitle={setTitle}
        sizeUnit={sizeUnit}
        setSizeUnit={setSizeUnit}
        width={width}
        setWidth={setWidth}
        height={height}
        setHeight={setHeight}
        depth={depth}
        setDepth={setDepth}
        onAddPrice={addPrice}
        {...rest}
      >
        {}
      </Shell>
    );

  return (
    <Shell
      unitAmount={unitAmount}
      setUnitAmount={setUnitAmount}
      title={title}
      setTitle={setTitle}
      sizeUnit={sizeUnit}
      setSizeUnit={setSizeUnit}
      width={width}
      setWidth={setWidth}
      height={height}
      setHeight={setHeight}
      depth={depth}
      setDepth={setDepth}
      onAddPrice={addPrice}
      {...rest}
    >
      {prices.map((item, idx) => (
        <PricingEntry key={item.id ?? idx} item={item} onRemove={removePrice}></PricingEntry>
      ))}
    </Shell>
  );
}

function Shell({
  children,
  unitAmount,
  setUnitAmount,
  title,
  setTitle,
  sizeUnit,
  setSizeUnit,
  width,
  setWidth,
  height,
  setHeight,
  depth,
  setDepth,
  onAddPrice,
  ...rest
}: {
  children: ReactNode;
  unitAmount?: number;
  setUnitAmount: Dispatch<SetStateAction<number | undefined>>;
  title?: string;
  setTitle: Dispatch<SetStateAction<string | undefined>>;
  sizeUnit: 'in' | 'cm';
  setSizeUnit: Dispatch<SetStateAction<'in' | 'cm'>>;
  width?: number;
  setWidth: Dispatch<SetStateAction<number | undefined>>;
  height?: number;
  setHeight: Dispatch<SetStateAction<number | undefined>>;
  depth?: number;
  setDepth: Dispatch<SetStateAction<number | undefined>>;
  onAddPrice: Dispatch<SetStateAction<void>>;
} & BaseHTMLAttributes<HTMLElement>) {
  const checkPriceValidity = (form: HTMLFormElement | null) => {
    if (!form) return;

    if (!form.checkValidity()) {
      return;
    }

    onAddPrice();
  };
  const form = useRef<HTMLFormElement>(null);
  return (
    <>
      <section className='flex w-full flex-col py-4' {...rest}>
        <form ref={form} className='grid grid-cols-8 gap-4'>
          <label className='col-span-2 block'>
            <span className='text-gray-700'>Price Name</span>
            <input
              type='text'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 invalid:focus:border-red-500'
              placeholder='New price option name'
              value={title ?? ''}
              required
              pattern={'[\\w\\s\\d]+'}
              minLength={1}
              maxLength={500}
              onChange={(evt) => setTitle(evt.target.value)}
            />
          </label>
          <div className='col-span-1 w-full'>
            <label htmlFor='width-input' className='block text-gray-700'>
              Item Width
            </label>
            <div className='relative mt-1 flex rounded-md shadow-sm focus-within:border-primary-300 focus-within:ring focus-within:ring-primary-200 focus-within:ring-opacity-50'>
              <input
                type='number'
                name='width-input'
                id='width-input'
                className='focus:ring-0rounded-none peer block w-full rounded-l-md border-gray-300 focus:ring-0 invalid:focus:border-red-500 '
                placeholder='Width'
                min='0'
                required
                step='any'
                value={width ?? ''}
                onChange={(evt) => setWidth(parseFloat(evt.target.value))}
              />
              <span className='inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-primary-100 px-3 text-sm text-primary-500 peer-invalid:peer-focus:border-red-500'>
                {sizeUnit}
              </span>
            </div>
          </div>
          <div className='col-span-1 w-full'>
            <label htmlFor='height-input' className='block text-gray-700'>
              Item Height
            </label>
            <div className='mt-1 flex rounded-md shadow-sm focus-within:border-primary-300 focus-within:ring focus-within:ring-primary-200 focus-within:ring-opacity-50'>
              <input
                type='number'
                name='height-input'
                id='height-input'
                className='peer block w-full rounded-none rounded-l-md border-gray-300 focus:border-primary-300 focus:ring-0 invalid:focus:border-red-500'
                placeholder='Height'
                min='0'
                required
                step='any'
                value={height ?? ''}
                onChange={(evt) => setHeight(parseFloat(evt.target.value))}
              />
              <span className='inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-primary-100 px-3 text-sm text-primary-500 peer-invalid:peer-focus:border-red-500'>
                {sizeUnit}
              </span>
            </div>
          </div>
          <div className='col-span-1 w-full'>
            <label
              htmlFor='depth-input'
              className='block text-gray-700'
              title='Optional; for use with future shipping options'
            >
              Item Depth <RiQuestionLine className='inline-block'></RiQuestionLine>
            </label>
            <div className='mt-1 flex rounded-md shadow-sm focus-within:border-primary-300 focus-within:ring focus-within:ring-primary-200 focus-within:ring-opacity-50'>
              <input
                type='number'
                name='depth-input'
                id='depth-input'
                className='block w-full rounded-none rounded-l-md border-gray-300 invalid:border-red-500 focus:border-primary-300  focus:ring-0 invalid:focus:border-red-500'
                placeholder='Depth'
                min='0'
                step='any'
                value={depth ?? ''}
                onChange={(evt) => setDepth(parseFloat(evt.target.value))}
              />
              <span className='inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-primary-100 px-3 text-sm text-primary-500 invalid:border-red-500'>
                {sizeUnit}
              </span>
            </div>
          </div>
          <div className='col-span-1 block cursor-pointer select-none'>
            <Switch.Group>
              <Switch.Label className='block'>Unit</Switch.Label>
              <Switch
                checked={sizeUnit === 'in'}
                onChange={() => setSizeUnit((unit) => (unit === 'cm' ? 'in' : 'cm'))}
                className={clsxm(
                  'bg-primary-200',
                  'relative',
                  'mt-1',
                  'inline-flex',
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
                    sizeUnit === 'in' ? 'translate-x-6' : 'translate-x-0',
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
                  {sizeUnit}
                </span>
              </Switch>
            </Switch.Group>
          </div>
          <label className='col-span-1 block'>
            <span className='text-gray-700'>Price</span>
            <input
              type='number'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 invalid:focus:border-red-500'
              placeholder='Price'
              required
              min={0}
              value={unitAmount ?? ''}
              onChange={(evt) => setUnitAmount(parseFloat(evt.target.value))}
            />
          </label>

          <Button
            className='justify-center self-end'
            variant='light'
            disabled={!title || !width || !height || !unitAmount}
            onClick={() => checkPriceValidity(form.current)}
          >
            Add Price
          </Button>
        </form>
        <div className='flex w-full flex-col'>{children}</div>
      </section>
    </>
  );
}

function PricingEntry({ item, onRemove }: { item: Price; onRemove: Dispatch<Price> }) {
  const {
    id,
    unit_amount,
    currency,
    metadata: { width, height, unit, medium, depth },
  } = item;

  return (
    <div
      id={id}
      className={clsxm(
        'border-primary-300-400 group grid grid-cols-6 grid-rows-2 border-b-2 py-4 last:border-b-0',
        item.active ? '' : 'text-primary-300'
      )}
    >
      <span className={clsxm('col-span-3', item.active ? '' : 'line-through')}>{medium}</span>
      <span className={clsxm('row-start-2 italic', item.active ? '' : 'line-through')}>
        {width}
        {unit} x {height}
        {unit}
        {depth !== undefined ? ` x ${depth}${unit}` : ''}
      </span>
      <PriceDisplay
        amount={unit_amount ?? 0}
        currency={currency}
        className={clsxm(
          'col-start-5 row-span-2 flex flex-row items-center justify-end pr-2',
          item.active ? '' : 'line-through'
        )}
      ></PriceDisplay>
      <Button
        variant={item.active ? 'outline' : 'ghost'}
        className='col-start-6 row-span-2 block w-full hover:!bg-primary-100 group-hover:bg-primary-50'
        onClick={() => onRemove(item)}
      >
        {item.active ? (Object.hasOwn(item, 'id') ? 'Hide' : 'Delete') : 'Restore'}
      </Button>
    </div>
  );
}
