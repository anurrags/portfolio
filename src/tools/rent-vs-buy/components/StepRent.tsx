import React from 'react';
import { SliderField } from './SliderField';
import { RentInputs } from '../types';

interface StepRentProps {
  values: RentInputs;
  onChange: <K extends keyof RentInputs>(key: K, val: RentInputs[K]) => void;
}

export const StepRent: React.FC<StepRentProps> = ({ values, onChange }) => {
  return (
    <div className="rvb-step-content">
      <div className="rvb-step-intro">
        <h2 className="rvb-step-title">Rent Assumptions</h2>
        <p className="rvb-step-desc">
          Specify your current or expected rental costs, annual escalation, and security deposit.
        </p>
      </div>

      <div className="rvb-fields-stack">
        <SliderField
          id="monthlyRent"
          label="Monthly Rent (including maintenance)"
          value={values.monthlyRent}
          min={5000}
          max={500000}
          step={1000}
          prefix="₹"
          helperText="Your current monthly rent expense including common society maintenance"
          presetChips={[
            { label: '₹20k', value: 20000 },
            { label: '₹35k', value: 35000 },
            { label: '₹50k', value: 50000 },
            { label: '₹75k', value: 75000 },
          ]}
          onChange={(val) => onChange('monthlyRent', val)}
        />

        <SliderField
          id="rentalGrowth"
          label="Annual Rental Growth"
          value={values.rentalGrowth}
          min={1}
          max={15}
          step={0.5}
          suffix="% p.a."
          helperText="Expected annual percentage increase in your rent (typically 5%–8% in metros)"
          presetChips={[
            { label: '4%', value: 4 },
            { label: '5%', value: 5 },
            { label: '7%', value: 7 },
            { label: '10%', value: 10 },
          ]}
          onChange={(val) => onChange('rentalGrowth', val)}
        />

        <SliderField
          id="securityDeposit"
          label="Security Deposit"
          value={values.securityDeposit}
          min={10000}
          max={1500000}
          step={5000}
          prefix="₹"
          helperText="Refundable deposit locked with the landlord (usually 2 to 6 months of rent)"
          presetChips={[
            { label: '₹50k', value: 50000 },
            { label: '₹1 Lakh', value: 100000 },
            { label: '₹2 Lakh', value: 200000 },
          ]}
          onChange={(val) => onChange('securityDeposit', val)}
        />
      </div>
    </div>
  );
};
