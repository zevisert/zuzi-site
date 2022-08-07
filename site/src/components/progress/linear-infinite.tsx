import clsxm from '@/lib/clsxm';

export default function ProgressLinearInfinite({
  title,
  barStyle = 'bg-gradient-to-r from-gray-300 to-primary-500',
  bgStyle = 'bg-gray-100',
}: {
  title: string;
  barStyle?: string;
  bgStyle?: string;
}) {
  return (
    <div className='relative'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='inline-block rounded-full bg-stone-200 py-1 px-2 text-xs font-semibold uppercase text-stone-600'>
          {title}
        </span>
      </div>
      <div
        className={clsxm(bgStyle, 'relative mb-4 inline-flex h-2 w-full overflow-hidden rounded')}
      >
        <div
          className={clsxm(
            barStyle,
            'absolute top-0 -left-full h-full w-full origin-left animate-progress-infinite'
          )}
        ></div>
      </div>
    </div>
  );
}
