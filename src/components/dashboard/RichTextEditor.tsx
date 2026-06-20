'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import './rich-editor.css';

type ToolbarAction = 'bold' | 'italic' | 'heading' | 'bullet' | 'ordered' | 'link' | 'paragraph';

function exec(action: ToolbarAction) {
  switch (action) {
    case 'bold':
      document.execCommand('bold');
      break;
    case 'italic':
      document.execCommand('italic');
      break;
    case 'heading':
      document.execCommand('formatBlock', false, 'h2');
      break;
    case 'paragraph':
      document.execCommand('formatBlock', false, 'p');
      break;
    case 'bullet':
      document.execCommand('insertUnorderedList');
      break;
    case 'ordered':
      document.execCommand('insertOrderedList');
      break;
    case 'link': {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
      break;
    }
  }
}

export function RichTextEditor({ value, onChange, placeholder }: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [isMounted, value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleToolbarClick = useCallback((action: ToolbarAction) => {
    editorRef.current?.focus();
    exec(action);
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full border border-stone-200 rounded-lg bg-stone-50 p-4 text-sm text-stone-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rich-editor border border-stone-200 rounded-lg overflow-hidden bg-white">
      <div className="rich-editor-toolbar flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-stone-200 bg-stone-50">
        <button type="button" className="rich-editor-btn" onClick={() => handleToolbarClick('paragraph')} title="Paragraph" tabIndex={-1}>
          <i className="fa-solid fa-paragraph"></i>
        </button>
        <button type="button" className="rich-editor-btn" onClick={() => handleToolbarClick('heading')} title="Heading" tabIndex={-1}>
          <i className="fa-solid fa-heading"></i>
        </button>
        <span className="w-px h-4 bg-stone-200 mx-1"></span>
        <button type="button" className="rich-editor-btn" onClick={() => handleToolbarClick('bold')} title="Bold (Ctrl+B)" tabIndex={-1}>
          <i className="fa-solid fa-bold"></i>
        </button>
        <button type="button" className="rich-editor-btn" onClick={() => handleToolbarClick('italic')} title="Italic (Ctrl+I)" tabIndex={-1}>
          <i className="fa-solid fa-italic"></i>
        </button>
        <span className="w-px h-4 bg-stone-200 mx-1"></span>
        <button type="button" className="rich-editor-btn" onClick={() => handleToolbarClick('bullet')} title="Bullet List" tabIndex={-1}>
          <i className="fa-solid fa-list-ul"></i>
        </button>
        <button type="button" className="rich-editor-btn" onClick={() => handleToolbarClick('ordered')} title="Numbered List" tabIndex={-1}>
          <i className="fa-solid fa-list-ol"></i>
        </button>
        <span className="w-px h-4 bg-stone-200 mx-1"></span>
        <button type="button" className="rich-editor-btn" onClick={() => handleToolbarClick('link')} title="Insert Link" tabIndex={-1}>
          <i className="fa-solid fa-link"></i>
        </button>
      </div>
      <div
        ref={editorRef}
        className="rich-editor-content min-h-[400px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7A1515]/20"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder || 'Start typing...'}
      />
    </div>
  );
}
