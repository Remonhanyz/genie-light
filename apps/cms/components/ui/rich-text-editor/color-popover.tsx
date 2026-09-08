"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COLOR_PALETTE } from "./constants";

interface ColorPopoverProps {
  getBtnClass: (isActive?: boolean) => string;
  preventFocusLoss: (e: React.MouseEvent) => void;
  onSelectColor: (color: string) => void;
}

export function ColorPopover({ getBtnClass, preventFocusLoss, onSelectColor }: ColorPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass()}
          onMouseDown={preventFocusLoss}
          title="Text Color"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2.5 bg-popover text-popover-foreground border border-default-200 dark:border-default-300 shadow-xl rounded-lg">
        <div className="grid grid-cols-8 gap-1.5">
          {COLOR_PALETTE.map((c, i) => (
            <button
              key={i}
              type="button"
              className="w-6 h-6 rounded border border-default-200 dark:border-default-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
              style={{ backgroundColor: c }}
              onMouseDown={preventFocusLoss}
              onClick={() => onSelectColor(c)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
