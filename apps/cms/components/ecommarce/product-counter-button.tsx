"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Minus, Plus } from "lucide-react";

interface ProductCounterButtonProps {
  initialCount?: number;
  onChange?: (count: number) => void;
}

const ProductCounterButton = ({
  initialCount = 1,
  onChange,
}: ProductCounterButtonProps) => {
  const [count, setCount] = useState(initialCount);

  const decrement = () => {
    const next = Math.max(1, count - 1);
    setCount(next);
    onChange?.(next);
  };

  const increment = () => {
    const next = count + 1;
    setCount(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7 rounded-full"
        onClick={decrement}
        disabled={count <= 1}
        type="button"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-6 text-center text-sm font-medium">{count}</span>
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7 rounded-full"
        onClick={increment}
        type="button"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ProductCounterButton;
