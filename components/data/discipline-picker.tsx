'use client'

import { useState } from 'react'
import { getAvailableDisciplines, type Discipline } from '@/lib/use-discipline-language'
import { Check } from 'lucide-react'

interface DisciplinePickerProps {
  value: Discipline | ''
  onChange: (discipline: Discipline) => void
  label?: string
  required?: boolean
}

export default function DisciplinePicker({
  value,
  onChange,
  label = 'Select your racing discipline',
  required = true,
}: DisciplinePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const disciplines = getAvailableDisciplines()
  const selected = disciplines.find((d) => d.id === value)

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-zinc-200 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-zinc-100 hover:border-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-lime-400/50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {selected && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selected.color }}
              aria-hidden="true"
            />
          )}
          {selected ? selected.label : 'Choose a discipline...'}
        </span>
        <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded shadow-lg">
          {disciplines.map((discipline) => (
            <button
              key={discipline.id}
              type="button"
              onClick={() => {
                onChange(discipline.id)
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-zinc-100 hover:bg-zinc-800 transition-colors"
              role="option"
              aria-selected={value === discipline.id}
            >
              <span className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: discipline.color }}
                  aria-hidden="true"
                />
                {discipline.label}
              </span>
              {value === discipline.id && (
                <Check className="w-5 h-5 text-lime-400" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
