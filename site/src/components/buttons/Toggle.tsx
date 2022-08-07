import { ChangeEventHandler, FunctionComponent } from 'react';
import { RiCheckFill, RiCloseFill } from 'react-icons/ri';

import clsxm from '@/lib/clsxm';

export const Toggle: FunctionComponent<{
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}> = ({ onChange, className = '', checked = false, disabled = false }) => {
  return (
    <>
      <input
        type='checkbox'
        className='sr-only'
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <div className={clsxm('relative', className)}>
        <div className='block h-8 w-14 rounded-full bg-[#E5E7EB]'></div>
        <div className='dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition'>
          <span className='active:hidden'>
            <RiCheckFill></RiCheckFill>
          </span>
          <span className={clsxm('text-body-color')}>
            <RiCloseFill></RiCloseFill>
          </span>
        </div>
      </div>
    </>
  );
};

export default Toggle;
