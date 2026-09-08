"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Paintbrush,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PainterMode } from "./types";
import { ColorPopover } from "./color-popover";
import { LinkPopover } from "./link-popover";

interface EditorToolbarProps {
  activeStates: Record<string, boolean>;
  painterMode: PainterMode;
  exec: (command: string, val?: string) => void;
  applyBlockFormat: (tag: string) => void;
  applyListFormat: (command: string, listTag: string) => void;
  handleSubscript: () => void;
  handleSuperscript: () => void;
  handleTextColor: (color: string) => void;
  handlePainterClick: (e: React.MouseEvent) => void;
  handlePainterDoubleClick: (e: React.MouseEvent) => void;
  handleClearFormatting: () => void;
  preventFocusLoss: (e: React.MouseEvent) => void;
  getBtnClass: (isActive?: boolean) => string;
  // Link props
  isLinkOpen: boolean;
  setIsLinkOpen: (open: boolean) => void;
  editingLinkNode: HTMLAnchorElement | null;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  linkText: string;
  setLinkText: (text: string) => void;
  handleOpenLinkPopover: () => void;
  handleApplyLink: (e?: React.SyntheticEvent) => void;
  handleRemoveLink: () => void;
}

export function EditorToolbar({
  activeStates,
  painterMode,
  exec,
  applyBlockFormat,
  applyListFormat,
  handleSubscript,
  handleSuperscript,
  handleTextColor,
  handlePainterClick,
  handlePainterDoubleClick,
  handleClearFormatting,
  preventFocusLoss,
  getBtnClass,
  isLinkOpen,
  setIsLinkOpen,
  editingLinkNode,
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  handleOpenLinkPopover,
  handleApplyLink,
  handleRemoveLink,
}: EditorToolbarProps) {
  return (
    <div className="rich-text-editor-toolbar flex flex-wrap items-center gap-1 p-2 border-b border-default-200 dark:border-default-300 select-none">
      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 border-r border-default-200 dark:border-default-300 pr-1 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass()}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("undo")}
          title="Undo"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass()}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("redo")}
          title="Redo"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Headings & Block styles */}
      <div className="flex items-center gap-0.5 border-r border-default-200 dark:border-default-300 pr-1 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.h1)}
          onMouseDown={preventFocusLoss}
          onClick={() => applyBlockFormat("h1")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.h2)}
          onMouseDown={preventFocusLoss}
          onClick={() => applyBlockFormat("h2")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.h3)}
          onMouseDown={preventFocusLoss}
          onClick={() => applyBlockFormat("h3")}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.blockquote)}
          onMouseDown={preventFocusLoss}
          onClick={() => applyBlockFormat("blockquote")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.pre)}
          onMouseDown={preventFocusLoss}
          onClick={() => applyBlockFormat("pre")}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 border-r border-default-200 dark:border-default-300 pr-1 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.bold)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.italic)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.underline)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("underline")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.strikeThrough)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.subscript)}
          onMouseDown={preventFocusLoss}
          onClick={handleSubscript}
          title="Subscript"
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.superscript)}
          onMouseDown={preventFocusLoss}
          onClick={handleSuperscript}
          title="Superscript"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 border-r border-default-200 dark:border-default-300 pr-1 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.insertUnorderedList)}
          onMouseDown={preventFocusLoss}
          onClick={() => applyListFormat("insertUnorderedList", "UL")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.insertOrderedList)}
          onMouseDown={preventFocusLoss}
          onClick={() => applyListFormat("insertOrderedList", "OL")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 border-r border-default-200 dark:border-default-300 pr-1 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.justifyLeft)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("justifyLeft")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.justifyCenter)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("justifyCenter")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.justifyRight)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("justifyRight")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(activeStates.justifyFull)}
          onMouseDown={preventFocusLoss}
          onClick={() => exec("justifyFull")}
          title="Align Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* Link & Colors */}
      <div className="flex items-center gap-0.5 border-r border-default-200 dark:border-default-300 pr-1 mr-1">
        <LinkPopover
          isLinkOpen={isLinkOpen}
          setIsLinkOpen={setIsLinkOpen}
          activeStatesLink={activeStates.link}
          editingLinkNode={editingLinkNode}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          linkText={linkText}
          setLinkText={setLinkText}
          handleOpenLinkPopover={handleOpenLinkPopover}
          handleApplyLink={handleApplyLink}
          handleRemoveLink={handleRemoveLink}
          getBtnClass={getBtnClass}
        />
        <ColorPopover
          getBtnClass={getBtnClass}
          preventFocusLoss={preventFocusLoss}
          onSelectColor={handleTextColor}
        />
      </div>

      {/* Format Painter & Clear */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass(painterMode !== "off")}
          onClick={handlePainterClick}
          onDoubleClick={handlePainterDoubleClick}
          title={
            painterMode === "multi"
              ? "Format Painter Active (Persistent / Double Clicked). Click to turn off."
              : painterMode === "single"
              ? "Format Painter Active (Single Use). Highlight text to paint."
              : "Format Painter (Click once for single use, double-click to lock active)"
          }
        >
          <Paintbrush className={`h-4 w-4 ${painterMode !== "off" ? "animate-pulse text-primary-foreground" : ""}`} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getBtnClass()}
          onMouseDown={preventFocusLoss}
          onClick={handleClearFormatting}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
