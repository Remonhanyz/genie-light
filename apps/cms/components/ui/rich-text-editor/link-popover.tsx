"use client";

import * as React from "react";
import { Link as LinkIcon, Unlink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface LinkPopoverProps {
  isLinkOpen: boolean;
  setIsLinkOpen: (open: boolean) => void;
  activeStatesLink?: boolean;
  editingLinkNode: HTMLAnchorElement | null;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  linkText: string;
  setLinkText: (text: string) => void;
  handleOpenLinkPopover: () => void;
  handleApplyLink: (e?: React.SyntheticEvent) => void;
  handleRemoveLink: () => void;
  getBtnClass: (isActive?: boolean) => string;
}

export function LinkPopover({
  isLinkOpen,
  setIsLinkOpen,
  activeStatesLink,
  editingLinkNode,
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  handleOpenLinkPopover,
  handleApplyLink,
  handleRemoveLink,
  getBtnClass,
}: LinkPopoverProps) {
  return (
    <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStatesLink)}
          onClick={handleOpenLinkPopover}
          title="Insert / Edit Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-popover text-popover-foreground border border-default-200 dark:border-default-300 shadow-xl rounded-lg space-y-3">
        <div className="font-semibold text-sm flex items-center justify-between">
          <span>{editingLinkNode ? "Edit Link" : "Insert Link"}</span>
          {editingLinkNode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
              onClick={handleRemoveLink}
            >
              <Unlink className="h-3.5 w-3.5 mr-1" /> Unlink
            </Button>
          )}
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="link-url-input" className="text-xs">
              URL
            </Label>
            <Input
              id="link-url-input"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyLink();
              }}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-text-input" className="text-xs">
              Display Text
            </Label>
            <Input
              id="link-text-input"
              placeholder="Link text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyLink();
              }}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsLinkOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs gap-1 cursor-pointer"
              onClick={() => handleApplyLink()}
            >
              <Check className="h-3.5 w-3.5" /> Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
