'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Decimal from 'decimal.js';
import { ChevronLeft, Delete, History } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

// --- DECIMAL.JS CONFIG ---
// Set high precision for accurate calculations, preventing floating point errors.
Decimal.set({
  precision: 80,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -100,
  toExpPos: 100,
});

// --- TYPE DEFINITIONS ---
type Token =
  | { type: 'num'; value: string }
  | { type: 'op'; value: '+' | '-' | '×' | '÷' | '%' }
  | { type: 'paren'; value: '(' | ')' };

type Mode = 'typing' | 'equaled';
type HistoryItem = { expr: string; result: string };

// --- CONSTANTS ---
const OPS = ['+', '-', '×', '÷', '%'] as const;
const PRECEDENCE: Record<string, number> = { '%': 3, '×': 2, '÷': 2, '+': 1, '-': 1 };

const KEYS = [
  'C', '⌫', '%', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '00', '0', '.', '=',
] as const;

// --- PARSER & EVALUATOR FUNCTIONS ---

/**
 * Breaks the input expression string into a sequence of tokens.
 * Handles numbers, operators, and parentheses.
 * @param expr - The raw input string.
 * @returns An array of Token objects.
 */
function tokenize(expr: string): Token[] {
  const out: Token[] = [];
  let buf = '';
  let i = 0;

  const flushBuf = () => {
    if (buf.length > 0) {
      out.push({ type: 'num', value: buf });
      buf = '';
    }
  };

  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (/\d/.test(ch) || ch === '.') {
      buf += ch;
      i++;
      continue;
    }

    if (ch === '(' || ch === ')') {
      flushBuf();
      out.push({ type: 'paren', value: ch });
      i++;
      continue;
    }

    const opMap: Record<string, Token['value']> = { '+': '+', '-': '-', '*': '×', '/': '÷', '×': '×', '÷': '÷', '%': '%' };
    if (opMap[ch]) {
      flushBuf();
      out.push({ type: 'op', value: opMap[ch] as Token['value'] });
      i++;
      continue;
    }

    throw new Error(`Invalid character: ${ch}`);
  }
  flushBuf();
  return out;
}

/**
 * Converts an infix token array to postfix (RPN) using the Shunting-yard algorithm.
 * Handles operator precedence and unary minus.
 * @param tokens - The array of tokens from tokenize().
 * @returns A new array of tokens in RPN order.
 */
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  let prev: Token | null = null;

  for (const t of tokens) {
    if (t.type === 'num') {
      output.push(t);
    } else if (t.type === 'op') {
      if (t.value === '-' && (!prev || (prev.type !== 'num' && !(prev.type === 'paren' && prev.value === ')')))) {
        output.push({ type: 'num', value: '0' });
      }
      while (
        stack.length &&
        stack[stack.length - 1].type === 'op' &&
        (
          PRECEDENCE[(stack[stack.length - 1] as any).value] > PRECEDENCE[t.value] ||
          (PRECEDENCE[(stack[stack.length - 1] as any).value] === PRECEDENCE[t.value])
        )
      ) {
        output.push(stack.pop()!);
      }
      stack.push(t);
    } else if (t.type === 'paren' && t.value === '(') {
      stack.push(t);
    } else if (t.type === 'paren' && t.value === ')') {
      while (stack.length && !(stack[stack.length - 1].type === 'paren' && (stack[stack.length - 1] as any).value === '(')) {
        output.push(stack.pop()!);
      }
      if (!stack.length || (stack[stack.length - 1] as any).value !== '(') throw new Error('Mismatched parentheses');
      stack.pop();
    }
    prev = t;
  }
  while (stack.length) {
    const s = stack.pop()!;
    if (s.type === 'paren') throw new Error('Mismatched parentheses');
    output.push(s);
  }
  return output;
}

/**
 * Evaluates a token array in RPN format.
 * @param tokens - RPN token array from toRPN().
 * @returns A Decimal.js object with the result.
 */
function evalRPN(tokens: Token[]): Decimal {
  const st: Decimal[] = [];

  const bin = (fn: (a: Decimal, b: Decimal) => Decimal) => {
    const b = st.pop(); const a = st.pop();
    if (a === undefined || b === undefined) throw new Error('Malformed expression');
    st.push(fn(a, b));
  };

  for (const t of tokens) {
    if (t.type === 'num') {
      if (!/^\d*\.?\d*$/.test(t.value)) throw new Error('Invalid number');
      st.push(new Decimal(t.value || '0'));
    } else if (t.type === 'op') {
      if (t.value === '+') bin((a, b) => a.add(b));
      else if (t.value === '-') bin((a, b) => a.sub(b));
      else if (t.value === '×') bin((a, b) => a.mul(b));
      else if (t.value === '÷') {
        bin((a, b) => {
          if (b.isZero()) throw new Error('Division by zero');
          return a.div(b);
        });
      } else if (t.value === '%') {
        const b = st.pop();
        if (b === undefined) throw new Error('Malformed expression');
        if (st.length > 0) {
            const a = st.pop()!;
            st.push(a.mul(b.div(100)));
        } else {
            st.push(b.div(100));
        }
      }
    }
  }
  if (st.length !== 1) throw new Error('Malformed expression');
  return st[0];
}

/**
 * Safely evaluates a mathematical expression string.
 * @param expr - The expression to evaluate.
 * @returns A formatted string of the result, or an empty string on error.
 */
function safeEval(expr: string): string {
  if (!expr.trim()) return '';
  try {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    const val = evalRPN(rpn);
    // Format to a fixed string, then remove trailing zeros from decimal part
    const s = val.toSignificantDigits(15).toFixed();
    if (s.includes('.')) {
      return s.replace(/\.?0+$/, '');
    }
    return s;
  } catch {
    return ''; // Return empty for live preview errors
  }
}

// --- UI COMPONENTS ---

const Key = ({
  onClick,
  label,
  className = '',
  ariaLabel,
}: {
  onClick: () => void;
  label: React.ReactNode;
  className?: string;
  ariaLabel: string;
}) => (
  <button
    onClick={onClick}
    className={`h-16 rounded-full text-2xl font-medium active:scale-[0.98] transition-transform flex items-center justify-center ${className}`}
    aria-label={ariaLabel}
  >
    {label}
  </button>
);


// --- MAIN CALCULATOR PAGE COMPONENT ---
export default function CalculatorPage() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<Mode>('typing');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Effect to lock scroll and zoom on this page
  useEffect(() => {
    document.body.classList.add('overflow-hidden', 'touch-none');
    const viewport = document.querySelector("meta[name=viewport]");
    const originalContent = viewport?.getAttribute("content");
    viewport?.setAttribute("content", `${originalContent},user-scalable=no`);

    return () => {
      document.body.classList.remove('overflow-hidden', 'touch-none');
      if (originalContent) {
        viewport?.setAttribute("content", originalContent);
      }
    };
  }, []);

  const liveResult = useMemo(() => {
    if (mode === 'typing') {
      return safeEval(expr);
    }
    return result; // In 'equaled' mode, liveResult holds the final result
  }, [expr, mode, result]);

  const handlePress = (k: (typeof KEYS)[number]) => {
    if (mode === 'equaled' && !OPS.includes(k as any) && k !== '=') {
      setExpr('');
      setResult('');
    }
    setMode('typing');

    if (k === '=') {
      try {
        const finalResult = safeEval(expr);
        if (finalResult === '') throw new Error('Invalid expression');
        
        // Add to history
        if (expr.trim()) {
            setHistory(prev => [{ expr: expr.replace(/\*/g, '×').replace(/\//g, '÷'), result: finalResult }, ...prev]);
        }

        setResult(finalResult);
        setExpr(finalResult); // Promote result to main expression for chaining
        setMode('equaled');

      } catch (e: any) {
        const errorMessage = e.message === 'Division by zero' ? 'Error' : 'Malformed';
        setResult(errorMessage);
        setHistory(prev => [{ expr: expr.replace(/\*/g, '×').replace(/\//g, '÷'), result: errorMessage }, ...prev]);
        setExpr(errorMessage);
        setMode('equaled');
      }
      return;
    }

    if (k === 'C') {
      setExpr('');
      setResult('');
      return;
    }

    if (k === '⌫') {
      setExpr(p => p.slice(0, -1));
      return;
    }
    
    // Handle starting new calculation
    if (mode === 'equaled') {
      // If an operator is pressed, chain the calculation
      if (OPS.includes(k as any)) {
        setExpr(result + k);
      } else { // Otherwise, start a new expression
        setExpr(String(k));
      }
    } else {
       if (k === '.' && (expr.endsWith('.') || expr.split(/[\+\-×÷%]/).pop()?.includes('.'))) {
        return; // Prevent multiple decimals in one number
      }
      setExpr(p => p + k);
    }
  };

  const onKey = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const k = e.key;
    
    if (k === 'Enter' || k === '=') { handlePress('='); return; }
    if (k === 'Backspace') { handlePress('⌫'); return; }
    if (k.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) return;
    if (k.toLowerCase() === 'c') { handlePress('C'); return; }
    
    const keyMap: Record<string, string> = { '*': '×', '/': '÷' };
    const allowed = '0123456789.+-*/()%';
    if (allowed.includes(k)) {
      handlePress((keyMap[k] ?? k) as any);
    }
  }, [expr, result, mode]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  const prettyExpr = useMemo(() => expr.replace(/\*/g, '×').replace(/\//g, '÷'), [expr]);
  
  const getDisplayFontSize = (value: string) => {
    const length = value.length;
    if (length > 20) return 'text-3xl';
    if (length > 12) return 'text-4xl';
    if (length > 8) return 'text-5xl';
    return 'text-6xl';
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setExpr(item.result);
    setResult('');
    setMode('typing');
    setIsHistoryOpen(false);
  };
  
  const topDisplayValue = mode === 'typing' ? prettyExpr : result;
  const bottomDisplayValue = mode === 'typing' ? liveResult : prettyExpr;

  return (
    <main className="min-h-dvh bg-[#F6F7FB] dark:bg-black text-neutral-900 dark:text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col h-[90dvh] max-h-[750px] relative bg-white dark:bg-[#1C1C1C] rounded-3xl shadow-lg border border-neutral-200 dark:border-neutral-800">
        
        <header className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center">
            <Link href="/#home" passHref className="flex items-center text-purple-500 dark:text-purple-400">
                <ChevronLeft className="h-7 w-7" />
            </Link>
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <History className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl h-[60%]">
                    <SheetHeader>
                        <SheetTitle>Riwayat</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4 text-right overflow-y-auto h-[calc(100%-4rem)] pr-2">
                        {history.length > 0 ? history.map((item, index) => (
                             <button key={index} onClick={() => handleHistoryClick(item)} className="block w-full text-right p-2 rounded-md hover:bg-muted">
                                <p className="text-sm text-muted-foreground">{item.expr}</p>
                                <p className="text-2xl font-semibold">{item.result}</p>
                            </button>
                        )) : (
                            <p className="text-center text-muted-foreground pt-10">Belum ada riwayat.</p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </header>

        <div className="flex-1 flex flex-col items-end justify-end p-6 text-right pt-20 overflow-hidden">
          <div
            className={`w-full font-medium tabular-nums break-all transition-all duration-200 ${getDisplayFontSize(topDisplayValue)}`}
            title={topDisplayValue}
            aria-label="Main Display"
          >
            {topDisplayValue || '0'}
          </div>
          <div className="text-2xl text-neutral-500 dark:text-neutral-400 truncate h-10 mt-2 w-full" aria-live="polite">
            {bottomDisplayValue || ' '}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 p-4 bg-neutral-50 dark:bg-[#272727] rounded-b-3xl">
          <Key onClick={() => handlePress('C')} label="C" className="bg-neutral-100 dark:bg-neutral-700 text-red-500" ariaLabel="Clear" />
          <Key onClick={() => handlePress('⌫')} label={<Delete />} className="bg-neutral-100 dark:bg-neutral-700 text-purple-500" ariaLabel="Backspace" />
          <Key onClick={() => handlePress('%')} label="%" className="bg-neutral-100 dark:bg-neutral-700 text-purple-500" ariaLabel="Percent" />
          <Key onClick={() => handlePress('÷')} label="÷" className="bg-neutral-100 dark:bg-neutral-700 text-purple-500" ariaLabel="Divide" />

          {['7', '8', '9'].map(k => <Key key={k} onClick={() => handlePress(k)} label={k} className="bg-white dark:bg-[#3C4043]" ariaLabel={`Number ${k}`} />)}
          <Key onClick={() => handlePress('×')} label="×" className="bg-neutral-100 dark:bg-neutral-700 text-purple-500" ariaLabel="Multiply" />

          {['4', '5', '6'].map(k => <Key key={k} onClick={() => handlePress(k)} label={k} className="bg-white dark:bg-[#3C4043]" ariaLabel={`Number ${k}`} />)}
          <Key onClick={() => handlePress('-')} label="-" className="bg-neutral-100 dark:bg-neutral-700 text-purple-500" ariaLabel="Subtract" />
          
          {['1', '2', '3'].map(k => <Key key={k} onClick={() => handlePress(k)} label={k} className="bg-white dark:bg-[#3C4043]" ariaLabel={`Number ${k}`} />)}
          <Key onClick={() => handlePress('+')} label="+" className="bg-neutral-100 dark:bg-neutral-700 text-purple-500" ariaLabel="Add" />
          
          <Key onClick={() => handlePress('00')} label="00" className="bg-white dark:bg-[#3C4043]" ariaLabel="Double Zero" />
          <Key onClick={() => handlePress('0')} label="0" className="bg-white dark:bg-[#3C4043]" ariaLabel="Zero" />
          <Key onClick={() => handlePress('.')} label="." className="bg-white dark:bg-[#3C4043]" ariaLabel="Decimal" />
          <Key onClick={() => handlePress('=')} label="=" className="bg-purple-500 text-white" ariaLabel="Equals" />
        </div>
      </div>
    </main>
  );
}
