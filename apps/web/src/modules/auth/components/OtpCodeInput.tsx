import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

const DIGITS = 6;

type OtpCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const OtpCodeInput = ({
  value,
  onChange,
  disabled = false,
  autoFocus = false
}: OtpCodeInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: DIGITS }, (_, i) => value[i] ?? "");

  const focusAt = (index: number) => {
    const el = inputsRef.current[index];
    el?.focus();
    el?.select();
  };

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, DIGITS));
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, DIGITS - index).split("");
      const next = digits.slice();
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      onChange(next.join("").slice(0, DIGITS));
      focusAt(Math.min(index + chars.length, DIGITS - 1));
      return;
    }

    setDigit(index, cleaned);
    if (index < DIGITS - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      focusAt(index - 1);
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight" && index < DIGITS - 1) {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    if (!pasted) return;
    onChange(pasted);
    focusAt(Math.min(pasted.length, DIGITS) - 1);
  };

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-lg border border-border bg-background text-center text-lg font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      ))}
    </div>
  );
};
