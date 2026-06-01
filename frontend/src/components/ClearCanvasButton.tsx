import { useState } from "react";

interface ClearCanvasButtonProps {
  onClear: () => void;
}

export function ClearCanvasButton({ onClear }: ClearCanvasButtonProps) {
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onClear();
  }

  function handleCancel() {
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="clear-confirm">
        <span className="clear-confirm__text">Clear all drawings?</span>
        <button className="button button--danger button--small" onClick={handleClick}>
          Yes, Clear
        </button>
        <button className="button button--secondary button--small" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button className="button button--secondary" onClick={handleClick}>
      Clear Canvas
    </button>
  );
}
