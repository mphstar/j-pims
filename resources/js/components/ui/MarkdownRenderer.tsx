'use client';
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/**
 * Markdown Renderer component for displaying markdown content.
 * Always renders in light mode with inherited text color for simplicity.
 * Used in frontend views and form previews.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    if (!content) return null;

    return (
        <div data-color-mode="light" className={cn('markdown-body', className)}>
            <MDEditor.Markdown
                source={content}
                style={{ backgroundColor: 'transparent', color: 'inherit' }}
            />
        </div>
    );
}
