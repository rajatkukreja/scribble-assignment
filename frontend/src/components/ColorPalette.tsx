interface ColorPaletteProps {
  selected: string;
  onChange: (color: string) => void;
}

const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#0000FF",
  "#00AA00", "#FFFF00", "#FF8800", "#AA00FF"
];

export function ColorPalette({ selected, onChange }: ColorPaletteProps) {
  return (
    <div className="color-palette">
      {COLORS.map((color) => (
        <button
          key={color}
          className={`color-swatch${selected === color ? " color-swatch--selected" : ""}`}
          style={{ backgroundColor: color, border: color === "#FFFFFF" ? "1px solid #d1d5db" : undefined }}
          onClick={() => onChange(color)}
          aria-label={`Color ${color}`}
        />
      ))}
    </div>
  );
}
