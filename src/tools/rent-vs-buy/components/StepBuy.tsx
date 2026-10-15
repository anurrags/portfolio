import React, { useState } from 'react';
import { SliderField } from './SliderField';
import { CityModal } from './CityModal';
import { BuyInputs } from '../types';

interface StepBuyProps {
  values: BuyInputs;
  onChange: <K extends keyof BuyInputs>(key: K, val: BuyInputs[K]) => void;
}

export const StepBuy: React.FC<StepBuyProps> = ({ values, onChange }) => {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const setDownPaymentPercent = (pct: number) => {
    onChange('downPayment', Math.round((values.housePrice * pct) / 100));
  };

  const setOneTimeCostsPercent = (pct: number) => {
    onChange('oneTimeCosts', Math.round((values.housePrice * pct) / 100));
  };

  return (
    <div className="rvb-step-content">
      <div className="rvb-step-intro">
        <h2 className="rvb-step-title">Property & Loan Details</h2>
        <p className="rvb-step-desc">
          Enter the purchase price, loan terms, appreciation forecast, and ownership expenses.
        </p>
      </div>

      <div className="rvb-fields-stack">
        <SliderField
          id="housePrice"
          label="Property Purchase Price"
          value={values.housePrice}
          min={1000000}
          max={50000000}
          step={100000}
          prefix="₹"
          helperText="Total agreement value of the property you intend to buy"
          presetChips={[
            { label: '₹60 Lakh', value: 6000000 },
            { label: '₹1 Crore', value: 10000000 },
            { label: '₹1.5 Crore', value: 15000000 },
            { label: '₹2.5 Crore', value: 25000000 },
          ]}
          onChange={(val) => {
            onChange('housePrice', val);
            // Auto adjust down payment to 20% if currently 20%
            if (values.downPayment === Math.round(values.housePrice * 0.2)) {
              onChange('downPayment', Math.round(val * 0.2));
            }
          }}
        />

        <SliderField
          id="downPayment"
          label="Down Payment"
          value={values.downPayment}
          min={100000}
          max={values.housePrice}
          step={50000}
          prefix="₹"
          helperText={`Currently ${Math.round((values.downPayment / values.housePrice) * 100)}% of property price`}
          presetChips={[
            { label: '10%', value: Math.round(values.housePrice * 0.1) },
            { label: '20%', value: Math.round(values.housePrice * 0.2) },
            { label: '30%', value: Math.round(values.housePrice * 0.3) },
            { label: '40%', value: Math.round(values.housePrice * 0.4) },
          ]}
          onChange={(val) => onChange('downPayment', val)}
        />

        <div className="rvb-two-col">
          <SliderField
            id="loanTenure"
            label="Loan Tenure"
            value={values.loanTenure}
            min={5}
            max={30}
            step={1}
            suffix="years"
            presetChips={[
              { label: '15y', value: 15 },
              { label: '20y', value: 20 },
              { label: '25y', value: 25 },
              { label: '30y', value: 30 },
            ]}
            onChange={(val) => onChange('loanTenure', val)}
          />

          <SliderField
            id="interestRate"
            label="Home Loan Interest Rate"
            value={values.interestRate}
            min={6}
            max={15}
            step={0.1}
            suffix="% p.a."
            presetChips={[
              { label: '8.5%', value: 8.5 },
              { label: '9.0%', value: 9.0 },
              { label: '9.5%', value: 9.5 },
              { label: '10.0%', value: 10.0 },
            ]}
            onChange={(val) => onChange('interestRate', val)}
          />
        </div>

        <SliderField
          id="houseAppreciationRate"
          label="Property Appreciation Rate"
          value={values.houseAppreciationRate}
          min={1}
          max={20}
          step={0.1}
          suffix="% p.a."
          helperText="Expected annual compound growth rate of the property value"
          actionButton={{
            label: '📍 Select by City',
            onClick: () => setIsCityModalOpen(true),
          }}
          presetChips={[
            { label: '5.2% Delhi', value: 5.2 },
            { label: '6.7% Mumbai', value: 6.71 },
            { label: '9.0% Bangalore', value: 9.0 },
            { label: '9.9% Kochi', value: 9.9 },
          ]}
          onChange={(val) => onChange('houseAppreciationRate', val)}
        />

        <div className="rvb-two-col">
          <SliderField
            id="oneTimeCosts"
            label="One-Time Buying Costs"
            value={values.oneTimeCosts}
            min={50000}
            max={5000000}
            step={25000}
            prefix="₹"
            helperText="Stamp duty, registration, legal fees, and interior woodwork (typically 5%–10%)"
            presetChips={[
              { label: '5%', value: Math.round(values.housePrice * 0.05) },
              { label: '7%', value: Math.round(values.housePrice * 0.07) },
              { label: '10%', value: Math.round(values.housePrice * 0.1) },
            ]}
            onChange={(val) => onChange('oneTimeCosts', val)}
          />

          <SliderField
            id="annualMaintenanceCosts"
            label="Annual Maintenance Cost"
            value={values.annualMaintenanceCosts}
            min={5000}
            max={500000}
            step={2000}
            prefix="₹"
            helperText="Society maintenance, property taxes & repairs (inflates at 5% annually)"
            presetChips={[
              { label: '₹25k', value: 25000 },
              { label: '₹35k', value: 35000 },
              { label: '₹60k', value: 60000 },
            ]}
            onChange={(val) => onChange('annualMaintenanceCosts', val)}
          />
        </div>
      </div>

      <CityModal
        isOpen={isCityModalOpen}
        selectedCityRate={values.houseAppreciationRate}
        onSelectCity={(preset) => onChange('houseAppreciationRate', preset.rate)}
        onClose={() => setIsCityModalOpen(false)}
      />
    </div>
  );
};
