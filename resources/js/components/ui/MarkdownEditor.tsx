'use client';
import React, { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    height?: number;
    className?: string;
}

/**
 * Markdown Editor component with light/dark mode support.
 * Uses @uiw/react-md-editor internally.
 */
export function MarkdownEditor({ value, onChange, height = 200, className }: MarkdownEditorProps) {
    const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Detect dark mode from document class or prefers-color-scheme
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            setColorMode(isDark ? 'dark' : 'light');
        };
        checkDarkMode();

        // Listen for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', checkDarkMode);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', checkDarkMode);
        };
    }, []);

    return (
        <div data-color-mode={colorMode} className={className}>
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || '')}
                height={height}
                preview="edit"
                hideToolbar={false}
            />
        </div>
    );
}
