import React from 'react';
import { cn } from '../../lib/utils'; // Assuming cn utility exists, usually standard in modern React setups. If not I will create it or use template literals.

// Simple utility if 'cn' is missing in the project
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={classNames(
                "animate-shimmer bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded-sm",
                className
            )}
            {...props}
        />
    );
};
