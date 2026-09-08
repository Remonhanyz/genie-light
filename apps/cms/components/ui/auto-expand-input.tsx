"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface AutoExpandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  minChars?: number;
  maxChars?: number;
  containerClassName?: string;
}

export const AutoExpandInput = React.forwardRef<HTMLInputElement, AutoExpandInputProps>(
  (
    {
      className,
      containerClassName,
      value,
      defaultValue,
      placeholder,
      minChars = 2,
      maxChars = 50,
      type = "text",
      onChange,
      onInput,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const [currentVal, setCurrentVal] = useState<string>(
      value !== undefined && value !== null
        ? String(value)
        : defaultValue !== undefined && defaultValue !== null
        ? String(defaultValue)
        : ""
    );

    useEffect(() => {
      if (value !== undefined && value !== null) {
        setCurrentVal(String(value));
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentVal(e.target.value);
      onChange?.(e);
    };

    const handleInputEvent = (e: any) => {
      setCurrentVal(e.target?.value ?? "");
      onInput?.(e);
    };

    // Calculate dynamic character width in real-time
    // Accounts for padding (px-2.5 = 20px) + border (2px) + cursor safety (6px) = 28px
    // Expands smoothly up to maxChars (50) and contracts smoothly down to minChars
    const textLen = currentVal.length;
    const placeholderLen = placeholder ? placeholder.length : minChars;
    const targetLen = textLen > 0 ? textLen : placeholderLen;
    const clampedChars = Math.min(maxChars, Math.max(minChars, targetLen));

    const widthStyle = `calc(${clampedChars}ch + 28px)`;
    const minWidthStyle = `calc(${minChars}ch + 28px)`;
    const maxWidthStyle = `calc(${maxChars}ch + 28px)`;

    return (
      <div
        className={cn("inline-block relative transition-all duration-75", containerClassName)}
        style={{
          width: widthStyle,
          minWidth: minWidthStyle,
          maxWidth: maxWidthStyle,
        }}
      >
        <input
          ref={forwardedRef}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onInput={handleInputEvent}
          style={{
            width: "100%",
            ...style,
          }}
          className={cn(
            "h-8 text-xs bg-background border border-input rounded-md px-2.5 py-1 text-foreground transition-all duration-75",
            "focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

AutoExpandInput.displayName = "AutoExpandInput";
