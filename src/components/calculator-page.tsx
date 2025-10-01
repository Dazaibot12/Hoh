'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Operator = '+' | '-' | '×' | '÷';

// iOS Calculator Button component
const CalculatorButton = ({
  onClick,
  label,
  className,
  span = '1',
}: {
  onClick: () => void;
  label: string;
  className?: string;
  span?: '1' | '2';
}) => (
  <Button
    variant="ghost"
    className={cn(
      'h-20 w-20 rounded-full text-3xl font-light',
      'flex items-center justify-center', // Ensure content is centered by default
      span === '2' && 'col-span-2 !w-auto justify-start pl-7', // For '0' button, start text but adjust padding
      className
    )}
    onClick={onClick}
  >
    {label}
  </Button>
);

export function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [activeOperator, setActiveOperator] = useState<Operator | null>(null);

  const formatNumber = (num: number) => {
    // iOS calculator uses 'en-US' locale for formatting and doesn't use grouping for smaller numbers
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 6, // Limit precision
      useGrouping: true,
    }).format(num);
  };

  const getDisplayFontSize = (value: string) => {
    const length = value.replace(/,/g, '').length;
    if (length > 9) return 'text-5xl';
    if (length > 8) return 'text-6xl';
    if (length > 7) return 'text-7xl';
    return 'text-8xl';
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      if (displayValue.replace(/,/g, '').length >= 9) return;
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
     setActiveOperator(null);
  };
  
  const inputDecimal = () => {
    if (waitingForOperand) {
        setDisplayValue('0.');
        setWaitingForOperand(false);
    } else if (!displayValue.includes('.')) {
        setDisplayValue(displayValue + '.');
    }
    setActiveOperator(null);
  }

  const clearAll = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setActiveOperator(null);
  };
  
  const clearEntry = () => {
    setDisplayValue('0');
  }

  const performOperation = (nextOperator: Operator) => {
    const inputValue = parseFloat(displayValue.replace(/,/g, ''));

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator && !waitingForOperand) {
      const result = calculate(previousValue, inputValue, operator);
      const formattedResult = formatNumber(result);
      setDisplayValue(formattedResult);
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
    setActiveOperator(nextOperator);
  };
  
  const handleEquals = () => {
    if (!operator || previousValue === null) return;
    const currentValue = parseFloat(displayValue.replace(/,/g, ''));
    const result = calculate(previousValue, currentValue, operator);
    const formattedResult = formatNumber(result);
    
    setDisplayValue(formattedResult);
    setPreviousValue(null); // Reset for new calculation
    setWaitingForOperand(true);
    setOperator(null);
    setActiveOperator(null);
  };

  const calculate = (firstOperand: number, secondOperand: number, op: Operator): number => {
    switch (op) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '×': return firstOperand * secondOperand;
      case '÷':
        if (secondOperand === 0) return NaN; // Handle division by zero
        return firstOperand / secondOperand;
    }
  };

  const toggleSign = () => {
    const currentValue = parseFloat(displayValue.replace(/,/g, ''));
    setDisplayValue(formatNumber(currentValue * -1));
  };

  const inputPercent = () => {
    const currentValue = parseFloat(displayValue.replace(/,/g, ''));
    setDisplayValue(formatNumber(currentValue / 100));
  };

  const renderValue = () => {
    if (displayValue === 'NaN') return 'Error';
    // Use 'en-US' locale for consistent display matching iOS
    const [integer, fraction] = displayValue.split('.');
    return `${parseInt(integer, 10).toLocaleString('en-US')}${fraction !== undefined ? '.' + fraction : ''}`;
  }

  // --- Button Color Classes ---
  const lightGrayButton = "bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white active:!bg-zinc-400 dark:active:!bg-zinc-600";
  const darkGrayButton = "bg-neutral-700 dark:bg-neutral-800 text-white active:!bg-neutral-600 dark:active:!bg-neutral-700";
  const orangeButton = "bg-orange-500 text-white active:!bg-orange-600";
  const activeOrangeButton = "bg-white text-orange-500";
  
  const isClearAll = displayValue === '0' || waitingForOperand;

  return (
    <div className="flex h-full w-full max-w-md mx-auto flex-col justify-end bg-black p-4">
      {/* Display */}
      <div className="flex-1 flex items-end justify-end pb-5">
        <h1 className={cn("font-thin text-white text-right break-all", getDisplayFontSize(renderValue()))}>
          {renderValue()}
        </h1>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-3">
        <CalculatorButton onClick={isClearAll ? clearAll : clearEntry} label={isClearAll ? "AC" : "C"} className={lightGrayButton} />
        <CalculatorButton onClick={toggleSign} label="±" className={lightGrayButton} />
        <CalculatorButton onClick={inputPercent} label="%" className={lightGrayButton} />
        <CalculatorButton onClick={() => performOperation('÷')} label="÷" className={cn(orangeButton, activeOperator === '÷' && activeOrangeButton)} />

        <CalculatorButton onClick={() => inputDigit('7')} label="7" className={darkGrayButton} />
        <CalculatorButton onClick={() => inputDigit('8')} label="8" className={darkGrayButton} />
        <CalculatorButton onClick={() => inputDigit('9')} label="9" className={darkGrayButton} />
        <CalculatorButton onClick={() => performOperation('×')} label="×" className={cn(orangeButton, activeOperator === '×' && activeOrangeButton)} />
        
        <CalculatorButton onClick={() => inputDigit('4')} label="4" className={darkGrayButton} />
        <CalculatorButton onClick={() => inputDigit('5')} label="5" className={darkGrayButton} />
        <CalculatorButton onClick={() => inputDigit('6')} label="6" className={darkGrayButton} />
        <CalculatorButton onClick={() => performOperation('-')} label="-" className={cn(orangeButton, activeOperator === '-' && activeOrangeButton)} />

        <CalculatorButton onClick={() => inputDigit('1')} label="1" className={darkGrayButton} />
        <CalculatorButton onClick={() => inputDigit('2')} label="2" className={darkGrayButton} />
        <CalculatorButton onClick={() => inputDigit('3')} label="3" className={darkGrayButton} />
        <CalculatorButton onClick={() => performOperation('+')} label="+" className={cn(orangeButton, activeOperator === '+' && activeOrangeButton)} />

        <CalculatorButton onClick={() => inputDigit('0')} label="0" className={darkGrayButton} span="2" />
        <CalculatorButton onClick={inputDecimal} label="." className={darkGrayButton} />
        <CalculatorButton onClick={handleEquals} label="=" className={orangeButton} />
      </div>
    </div>
  );
}
