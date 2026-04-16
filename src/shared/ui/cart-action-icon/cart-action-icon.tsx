type CartActionIconProps = {
    type: 'plus' | 'minus';
    className?: string;
};

export const CartActionIcon = ({ type, className }: CartActionIconProps) => {
    const path = type === 'plus' ? 'M8 3V13M3 8H13' : 'M3 8H13';

    return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
            <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
