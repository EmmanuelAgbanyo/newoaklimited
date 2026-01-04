import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ImageComponentProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
    fallbackSrc?: string;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
    src,
    alt,
    className = "",
    fallbackSrc = "https://placehold.co/600x400/e2e8f0/1e293b?text=NewOak+Asset",
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 animate-pulse">
                    <Loader2 className="w-6 h-6 text-gold animate-spin" />
                </div>
            )}

            <img
                src={hasError ? fallbackSrc : src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setHasError(true);
                    setIsLoaded(true);
                }}
                className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                {...props}
            />
        </div>
    );
};
