import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Global Loading Component
 * 
 * @param {Object} props
 * @param {string} props.text - Optional loading message
 * @param {boolean} props.fullScreen - If true, overlays the entire viewport with blur
 * @param {string} props.className - Additional classes for the container
 */
const Loading = ({
    text = "Loading...",
    fullScreen = true,
    className = ""
}) => {
    // If fullScreen is true, we occupy the parent container's full height to center in the page
    const containerClasses = fullScreen
        ? "flex-1 flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in duration-1000"
        : `flex flex-col items-center justify-center p-8 w-full h-full ${className}`;

    return (
        <div
            className={containerClasses}
            role="status"
            aria-live="polite"
        >
            <div className="flex flex-col items-center gap-8">
                {/* Thin Circular Spinner - Matching screenshot */}
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-[1.5px] border-emerald-500/10 rounded-full" />
                    <div className="absolute inset-0 border-[1.5px] border-t-emerald-500 rounded-full animate-spin" />
                </div>

                {text && (
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-[0.4em] text-center">
                        {text}
                    </p>
                )}
            </div>

            <span className="sr-only">Loading content...</span>
        </div>
    );
};

export default Loading;
