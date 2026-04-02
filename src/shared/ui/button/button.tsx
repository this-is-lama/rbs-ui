import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const Button = ({ children, type = 'button', ...props }: ButtonProps) => {
    return (
        <button type={type} {...props}>
            {children}
        </button>
    );
};