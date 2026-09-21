import React from 'react';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
    return (
        <div className="bg-cream border-b border-neutral-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand mb-3">
                    The Perfume Empire
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-3 text-neutral-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
