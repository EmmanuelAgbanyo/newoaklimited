import React, { useEffect, useRef, useState } from 'react';

function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'fade-up' | 'fade-in' | 'slide-in-right';
    delay?: number; // ms
    duration?: number; // ms
    threshold?: number; // 0-1 (visibility percentage to trigger)
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className,
    variant = 'fade-up',
    delay = 0,
    duration = 700,
    threshold = 0.1,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Trigger once
                }
            },
            {
                threshold,
                rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully in view
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    const variants = {
        'fade-up': 'translate-y-8',
        'fade-in': 'scale-95',
        'slide-in-right': 'translate-x-8',
    };

    const initialClass = variants[variant] || 'translate-y-8';

    return (
        <div
            ref={ref}
            className={classNames(
                className,
                "transition-all ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
                isVisible ? "opacity-100 transform-none" : `opacity-0 ${initialClass}`
            )}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};
