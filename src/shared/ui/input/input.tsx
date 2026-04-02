import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
    return (
        <div className="input">
            {label && <label className="input__label">{label}</label>}

            <input className="input__field" {...props} />

            {error && <span className="input__error">{error}</span>}
        </div>
    );
};