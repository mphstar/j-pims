import { motion } from 'framer-motion';
import React from 'react';

interface FancyButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export function FancyButton({ href, children, onClick, variant = 'primary', icon }: FancyButtonProps) {
  const baseClasses = "group relative inline-flex items-center gap-2 px-5 py-3 rounded-sm border text-sm font-medium tracking-wide overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black bg-transparent";
  
  const variantClasses = variant === 'primary' 
    ? "border-white/80 text-white"
    : "border-white/60 text-white/90";

  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick as (e: React.MouseEvent<HTMLAnchorElement>) => void}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className={`${baseClasses} ${variantClasses}`}
      >
        <span className="absolute inset-0">
          <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </span>
        <span className="relative z-10 flex items-center gap-2">
          <span className="transition-colors duration-500 group-hover:text-black">{children}</span>
          {icon || (
            <svg
              className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:stroke-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </span>
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick as (e: React.MouseEvent<HTMLButtonElement>) => void}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span className="absolute inset-0">
        <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      </span>
      <span className="relative z-10 flex items-center gap-2">
        <span className="transition-colors duration-500 group-hover:text-black">{children}</span>
        {icon || (
          <svg
            className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:stroke-black"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        )}
      </span>
    </motion.button>
  );
}
