"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Lock, ShieldAlert, Loader2, Delete } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

interface PinLockScreenProps {
  onUnlock: () => void;
}

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const pinStatus = useQuery(api.pinProtection.getPinStatus);
  const verifyPin = useMutation(api.pinProtection.verifyPin);

  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<string | null>(null);

  // Update lockout countdown
  useEffect(() => {
    if (!pinStatus?.isLocked || !pinStatus.lockoutRemainingMs) {
      setLockoutTime(null);
      return;
    }

    const updateCountdown = () => {
      if (!pinStatus.lockoutRemainingMs) return;
      
      const remaining = pinStatus.lockoutRemainingMs;
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      if (hours > 0) {
        setLockoutTime(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setLockoutTime(`${minutes}m ${seconds}s`);
      } else {
        setLockoutTime(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [pinStatus?.isLocked, pinStatus?.lockoutRemainingMs]);

  const handleDigitClick = useCallback(
    (digit: string) => {
      if (isVerifying || pinStatus?.isLocked) return;

      setError(null);
      const newPin = [...pin];
      const emptyIndex = newPin.findIndex((d) => d === "");

      if (emptyIndex !== -1) {
        newPin[emptyIndex] = digit;
        setPin(newPin);

        // Auto-submit when all digits entered
        if (emptyIndex === 5) {
          handleSubmit(newPin.join(""));
        }
      }
    },
    [pin, isVerifying, pinStatus?.isLocked]
  );

  const handleBackspace = useCallback(() => {
    if (isVerifying) return;
    setError(null);

    const newPin = [...pin];
    const lastFilledIndex = newPin.map((d) => d !== "").lastIndexOf(true);

    if (lastFilledIndex !== -1) {
      newPin[lastFilledIndex] = "";
      setPin(newPin);
    }
  }, [pin, isVerifying]);

  const handleSubmit = async (pinValue: string) => {
    if (pinValue.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      await verifyPin({ pin: pinValue });
      // Success! Store in session and unlock
      sessionStorage.setItem("pinVerified", "true");
      onUnlock();
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin(["", "", "", "", "", ""]);
      setError(err instanceof Error ? err.message : "Incorrect PIN");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVerifying || pinStatus?.isLocked) return;

      if (/^\d$/.test(e.key)) {
        handleDigitClick(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDigitClick, handleBackspace, isVerifying, pinStatus?.isLocked]);

  if (pinStatus === undefined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLocked = pinStatus.isLocked;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div
            className={cn(
              "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
              isLocked
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            )}
          >
            {isLocked ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLocked ? "Account Locked" : "Enter PIN"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLocked
              ? `Too many failed attempts. Try again in ${lockoutTime}`
              : "Enter your 6-digit PIN to unlock"}
          </p>
        </div>

        {/* PIN Display */}
        <div
          className={cn(
            "flex justify-center gap-3",
            shake && "animate-shake"
          )}
        >
          {pin.map((digit, index) => (
            <div
              key={index}
              className={cn(
                "w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
                digit
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-muted/50",
                isLocked && "opacity-50"
              )}
            >
              {digit ? "•" : ""}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && !isLocked && (
          <p className="text-center text-sm text-destructive font-medium">
            {error}
          </p>
        )}

        {/* Attempts Remaining */}
        {!isLocked && pinStatus.attemptsRemaining < 5 && (
          <p className="text-center text-sm text-amber-500 font-medium">
            {pinStatus.attemptsRemaining} attempts remaining
          </p>
        )}

        {/* Number Pad */}
        {!isLocked && (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleDigitClick(String(num))}
                disabled={isVerifying}
                className={cn(
                  "h-16 rounded-xl text-2xl font-semibold transition-all",
                  "bg-muted hover:bg-muted/80 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {num}
              </button>
            ))}
            <div /> {/* Empty space */}
            <button
              onClick={() => handleDigitClick("0")}
              disabled={isVerifying}
              className={cn(
                "h-16 rounded-xl text-2xl font-semibold transition-all",
                "bg-muted hover:bg-muted/80 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              disabled={isVerifying}
              className={cn(
                "h-16 rounded-xl flex items-center justify-center transition-all",
                "bg-muted hover:bg-muted/80 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Delete"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </div>
        )}
      </div>
    </div>
  );
}
