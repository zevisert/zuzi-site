import { RiEyeFill, RiEyeOffFill } from 'react-icons/ri';

export default function Active({ active }: { active: boolean }) {
  if (active) {
    return <RiEyeFill className='mx-auto fill-primary-600'></RiEyeFill>;
  }

  return <RiEyeOffFill className='mx-auto fill-primary-300'></RiEyeOffFill>;
}
