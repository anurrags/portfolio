import React from 'react';
import { CITY_PRESETS } from '../calculations';
import { CityPreset } from '../types';

interface CityModalProps {
  isOpen: boolean;
  selectedCityRate: number;
  onSelectCity: (preset: CityPreset) => void;
  onClose: () => void;
}

export const CityModal: React.FC<CityModalProps> = ({
  isOpen,
  selectedCityRate,
  onSelectCity,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="rvb-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rvb-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="rvb-modal-header">
          <div>
            <h3 className="rvb-modal-title">Select Metro Appreciation Rate</h3>
            <p className="rvb-modal-subtitle">
              Historical average residential property appreciation across major Indian cities
            </p>
          </div>
          <button
            type="button"
            className="rvb-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="rvb-city-list">
          {CITY_PRESETS.map((preset) => {
            const isSelected = selectedCityRate === preset.rate;
            return (
              <div
                key={preset.city}
                className={`rvb-city-row ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectCity(preset);
                  onClose();
                }}
              >
                <div className="rvb-city-info">
                  <span className="rvb-city-name">{preset.city}</span>
                  {preset.note && <span className="rvb-city-note">{preset.note}</span>}
                </div>
                <div className="rvb-city-rate-badge">
                  <span>{preset.rate}% p.a.</span>
                  <div className={`rvb-radio-circle ${isSelected ? 'checked' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rvb-modal-footer">
          <p className="rvb-disclaimer">
            *Note: Past appreciation does not guarantee future performance. You can also customize
            the slider manually.
          </p>
          <button type="button" className="rvb-btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
