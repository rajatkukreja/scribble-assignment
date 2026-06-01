interface BrushWidthSelectorProps {
  selected: number;
  onChange: (width: number) => void;
}

const WIDTHS = [
  { value: 1, label: "Thin" },
  { value: 3, label: "Medium" },
  { value: 6, label: "Thick" }
];

export function BrushWidthSelector({ selected, onChange }: BrushWidthSelectorProps) {
  return (
    <div className="brush-width-selector">
      {WIDTHS.map(({ value, label }) => (
        <button
          key={value}
          className={`brush-width-option${selected === value ? " brush-width-option--selected" : ""}`}
          onClick={() => onChange(value)}
          aria-label={label}
        >
          <span className="brush-width-preview" style={{ width: `${value * 4}px`, height: `${value * 4}px` }} />
          <span className="brush-width-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
