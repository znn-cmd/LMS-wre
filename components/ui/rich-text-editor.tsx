'use client'

import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Label } from '@/components/ui/label'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="min-h-[200px] border rounded-md p-4 bg-muted animate-pulse" />
})
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  id?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  label,
  id,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [internalValue, setInternalValue] = useState(value || '')
  const onChangeRef = useRef(onChange)
  const lastPropValueRef = useRef(value || '')

  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Sync internal value with prop value (only if prop changed externally)
  useEffect(() => {
    const normalizedValue = value || ''
    if (normalizedValue !== lastPropValueRef.current) {
      lastPropValueRef.current = normalizedValue
      setInternalValue(normalizedValue)
    }
  }, [value])

  useEffect(() => {
    setMounted(true)
  }, [])

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  )

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
  ]

  const handleChange = useCallback((newValue: string) => {
    setInternalValue(newValue)
    lastPropValueRef.current = newValue
    try {
      onChangeRef.current(newValue)
    } catch (error) {
      console.error('Error in onChange callback:', error)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <div className="min-h-[200px] border rounded-md p-4 bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="rich-text-editor-wrapper">
        <ReactQuill
          theme="snow"
          value={internalValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-background"
        />
      </div>
    </div>
  )
}

