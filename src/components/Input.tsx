import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef<
  HTMLInputElement,
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <input
      ref={ref}
      className={twMerge(
        'input border border-black bg-[transparent] px-2 w-full',
        className,
      )}
      {...rest}
    />
  );
});
