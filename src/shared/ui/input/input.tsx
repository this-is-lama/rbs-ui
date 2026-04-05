import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, id, ...props }, ref) => {
        const inputId = id ?? props.name;

        return (
            <div>
                {label ? <label htmlFor={inputId}>{label}</label> : null}
                <input id={inputId} ref={ref} {...props} />
                {error ? <div>{error}</div> : null}
            </div>
        );
    },
);

Input.displayName = 'Input';