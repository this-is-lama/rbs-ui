type ActionIconProps = {
    className?: string;
};

export const EditIcon = ({ className }: ActionIconProps) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M4 20H8L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5V6.5C17.6716 5.67157 16.3284 5.67157 15.5 6.5L5 17V20Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.5 8.5L16.5 11.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export const PlusIcon = ({ className }: ActionIconProps) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
            <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
        </svg>
    );
};

export const CloseIcon = ({ className }: ActionIconProps) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M7 7L17 17"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
            <path
                d="M17 7L7 17"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
        </svg>
    );
};

export const ChevronLeftIcon = ({ className }: ActionIconProps) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M14.5 6.5L9 12L14.5 17.5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export const ChevronRightIcon = ({ className }: ActionIconProps) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M9.5 6.5L15 12L9.5 17.5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
