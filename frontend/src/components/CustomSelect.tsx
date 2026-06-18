import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

type Props = {
  id?: string
  value: string
  options: Option[]
  placeholder: string
  onChange: (value: string) => void
  required?: boolean
}

export default function CustomSelect({ id, value, options, placeholder, onChange, required }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="custom-select" id={id}>
      {required && (
        <input
          tabIndex={-1}
          style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
          value={value}
          onChange={() => {}}
          required={required}
        />
      )}
      <button
        type="button"
        className={`custom-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'custom-select-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="custom-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="custom-select-menu" role="listbox">
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`custom-select-option ${o.value === value ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(o.value)
                setOpen(false)
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
