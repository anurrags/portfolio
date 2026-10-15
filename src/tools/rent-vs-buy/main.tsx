import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../shared/styles.css';
import { CalculatorApp } from './CalculatorApp';

const container = document.getElementById('root');
if (!container) throw new Error('#root missing from rent-vs-buy-calculator.html');

createRoot(container).render(
  <StrictMode>
    <CalculatorApp />
  </StrictMode>,
);
