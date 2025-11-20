interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: { container: 'gap-1.5', icon: 'w-5 h-5', text: 'text-sm' },
        md: { container: 'gap-2', icon: 'w-7 h-7', text: 'text-xl' },
        lg: { container: 'gap-3', icon: 'w-10 h-10', text: 'text-2xl' },
    };

    const config = sizes[size];

    return (
        <div className={`flex items-center ${config.container} ${className}`}>
            {/* Green Sprout Icon - SVG */}
            <svg
                className={config.icon}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Stem */}
                <path
                    d="M50 95 Q48 70, 50 45 T50 20"
                    stroke="#6FA84C"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Left Leaf */}
                <ellipse
                    cx="30"
                    cy="50"
                    rx="18"
                    ry="25"
                    fill="#6FA84C"
                    transform="rotate(-30 30 50)"
                />

                {/* Right Leaf */}
                <ellipse
                    cx="70"
                    cy="35"
                    rx="20"
                    ry="28"
                    fill="#2D5016"
                    transform="rotate(25 70 35)"
                />

                {/* Leaf veins */}
                <path
                    d="M30 50 Q32 45, 35 40"
                    stroke="#2D5016"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.3"
                />
                <path
                    d="M70 35 Q68 30, 65 25"
                    stroke="#6FA84C"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.3"
                />
            </svg>

            {/* Text */}
            {showText && (
                <span className={`font-bold ${config.text} leading-none`}>
                    <span className="text-[#2D5016]">Grow</span>
                    <span className="text-[#6FA84C]">Flow</span>
                </span>
            )}
        </div>
    );
}
