import React from 'react';

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  helperText?: string;
  presetChips?: { label: string; value: number }[];
  onChange: (val: number) => void;
  actionButton?: { label: string; onClick: () => void };
}

export const SliderField: React.FC<SliderFieldProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  prefix = '',
  suffix = '',
  helperText,
  presetChips,
  onChange,
  actionButton,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange(Math.min(max * 2, Math.max(0, num)));
    } else if (raw === '') {
      onChange(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  // Indian number comma formatting for text display
  const formatDisplay = (val: number): string => {
    if (isNaN(val)) return '0';
    const parts = val.toString().split('.');
    const integerPart = parts[0];
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedInt =
      otherNumbers !== ''
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
    return parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
  };

  return (
    <div className="rvb-field-group">
      <div className="rvb-field-header">
        <label htmlFor={id} className="rvb-field-label">
          {label}
        </label>
        <div className="rvb-field-input-box">
          {prefix && <span className="rvb-input-affix">{prefix}</span>}
          <input
            id={id}
            type="text"
            inputMode="decimal"
            className="rvb-numeric-input"
            value={formatDisplay(value)}
            onChange={handleInputChange}
          />
          {suffix && <span className="rvb-input-affix">{suffix}</span>}
        </div>
      </div>

      <div className="rvb-slider-track-wrap">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="rvb-slider"
          aria-label={label}
        />
      </div>

      {(helperText || actionButton || presetChips) && (
        <div className="rvb-field-footer">
          {helperText && <p className="rvb-helper-text">{helperText}</p>}
          <div className="rvb-footer-actions">
            {presetChips && (
              <div className="rvb-chips">
                {presetChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    className={`rvb-chip ${value === chip.value ? 'active' : ''}`}
                    onClick={() => onChange(chip.value)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
            {actionButton && (
              <button
                type="button"
                className="rvb-action-link"
                onClick={actionButton.onClick}
              >
                {actionButton.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
