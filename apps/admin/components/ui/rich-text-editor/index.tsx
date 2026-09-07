"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { RichTextEditorProps, CopiedFormatting, PainterMode } from "./types";
import { EditorToolbar } from "./toolbar";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write detailed description...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [painterMode, setPainterMode] = useState<PainterMode>("off");
  const [copiedFormat, setCopiedFormat] = useState<CopiedFormatting | null>(null);

  // Link Popover States
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [editingLinkNode, setEditingLinkNode] = useState<HTMLAnchorElement | null>(null);
  const savedLinkRangeRef = useRef<Range | null>(null);

  const isElementInTag = (node: Node | null, tagName: string): HTMLElement | null => {
    let curr: Node | null = node;
    while (curr && curr !== editorRef.current) {
      if (curr && curr.nodeName.toUpperCase() === tagName.toUpperCase()) {
        return curr as HTMLElement;
      }
      curr = curr ? curr.parentNode : null;
    }
    return null;
  };

  const unwrapElement = (el: HTMLElement) => {
    const parent = el.parentNode;
    if (!parent) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const contents = range.extractContents();
    parent.replaceChild(contents, el);
    parent.normalize();
  };

  const updateActiveStates = useCallback(() => {
    if (!editorRef.current) return;
    const states: Record<string, boolean> = {};
    try {
      states.bold = document.queryCommandState("bold");
      states.italic = document.queryCommandState("italic");
      states.underline = document.queryCommandState("underline");
      states.strikeThrough = document.queryCommandState("strikeThrough");
      states.subscript = document.queryCommandState("subscript");
      states.superscript = document.queryCommandState("superscript");
      states.insertUnorderedList = document.queryCommandState("insertUnorderedList");
      states.insertOrderedList = document.queryCommandState("insertOrderedList");
      states.justifyLeft = document.queryCommandState("justifyLeft");
      states.justifyCenter = document.queryCommandState("justifyCenter");
      states.justifyRight = document.queryCommandState("justifyRight");
      states.justifyFull = document.queryCommandState("justifyFull");

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const node = selection.anchorNode;
        states.h1 = !!isElementInTag(node, "H1");
        states.h2 = !!isElementInTag(node, "H2");
        states.h3 = !!isElementInTag(node, "H3");
        states.blockquote = !!isElementInTag(node, "BLOCKQUOTE");
        states.pre = !!isElementInTag(node, "PRE");
        states.link = !!isElementInTag(node, "A");
      }
    } catch {
      // Ignore queryCommandState errors
    }
    setActiveStates(states);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current || editorRef.current?.contains(document.activeElement)) {
        updateActiveStates();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateActiveStates]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveStates();
    }
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleSubscript = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const anchorNode = selection.anchorNode;
      const subEl = isElementInTag(anchorNode, "SUB");
      if (subEl) {
        unwrapElement(subEl);
        handleInput();
        return;
      }
      const supEl = isElementInTag(anchorNode, "SUP");
      if (supEl) {
        unwrapElement(supEl);
      }
    }
    document.execCommand("subscript", false);
    handleInput();
  };

  const handleSuperscript = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const anchorNode = selection.anchorNode;
      const supEl = isElementInTag(anchorNode, "SUP");
      if (supEl) {
        unwrapElement(supEl);
        handleInput();
        return;
      }
      const subEl = isElementInTag(anchorNode, "SUB");
      if (subEl) {
        unwrapElement(subEl);
      }
    }
    document.execCommand("superscript", false);
    handleInput();
  };

  const applyListFormat = (command: string, listTag: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const anchorNode = selection.anchorNode;
      const listEl = isElementInTag(anchorNode, listTag);
      if (listEl) {
        document.execCommand(command, false);
        handleInput();
        return;
      }
    }
    document.execCommand(command, false);
    handleInput();
  };

  const applyBlockFormat = (tag: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const anchorNode = selection.anchorNode;
    const existingElement = isElementInTag(anchorNode, tag);

    if (existingElement) {
      const p = document.createElement("p");
      p.innerHTML = existingElement.innerHTML;
      existingElement.parentNode?.replaceChild(p, existingElement);

      const newRange = document.createRange();
      newRange.selectNodeContents(p);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
      handleInput();
      return;
    }

    const targetTag = tag.toUpperCase();
    try {
      document.execCommand("formatBlock", false, `<${targetTag}>`);
    } catch {
      document.execCommand("formatBlock", false, targetTag);
    }
    handleInput();
  };

  const handleOpenLinkPopover = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedLinkRangeRef.current = selection.getRangeAt(0).cloneRange();
      const anchorNode = selection.anchorNode;
      const existingLink = isElementInTag(anchorNode, "A") as HTMLAnchorElement | null;
      if (existingLink) {
        setEditingLinkNode(existingLink);
        setLinkUrl(existingLink.getAttribute("href") || "https://");
        setLinkText(existingLink.textContent || "");
      } else {
        setEditingLinkNode(null);
        setLinkUrl("https://");
        const selectedStr = selection.toString();
        setLinkText(selectedStr);
      }
    }
  };

  const handleApplyLink = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl || linkUrl === "https://") return;

    if (editorRef.current) editorRef.current.focus();

    if (editingLinkNode) {
      editingLinkNode.setAttribute("href", linkUrl);
      if (linkText) editingLinkNode.textContent = linkText;
      handleInput();
      setIsLinkOpen(false);
      return;
    }

    const selection = window.getSelection();
    if (savedLinkRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedLinkRangeRef.current);
    }

    if (selection && !selection.isCollapsed) {
      document.execCommand("createLink", false, linkUrl);
    } else {
      const textToInsert = linkText || linkUrl;
      const a = document.createElement("a");
      a.href = linkUrl;
      a.textContent = textToInsert;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "text-primary underline font-medium";

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(a);
      } else if (editorRef.current) {
        editorRef.current.appendChild(a);
      }
    }
    handleInput();
    setIsLinkOpen(false);
  };

  const handleRemoveLink = () => {
    if (editingLinkNode) {
      unwrapElement(editingLinkNode);
      handleInput();
    } else {
      document.execCommand("unlink", false);
      handleInput();
    }
    setIsLinkOpen(false);
  };

  const handleTextColor = (color: string) => {
    exec("foreColor", color);
  };

  const captureFormatting = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const anchorNode = selection.anchorNode;
      const parentNode = anchorNode?.parentElement;
      const computed = parentNode ? window.getComputedStyle(parentNode) : null;

      setCopiedFormat({
        bold: !!(document.queryCommandState("bold") || (computed?.fontWeight === "700" || computed?.fontWeight === "bold")),
        italic: !!(document.queryCommandState("italic") || computed?.fontStyle === "italic"),
        underline: !!(document.queryCommandState("underline") || computed?.textDecoration?.includes("underline")),
        strike: !!(document.queryCommandState("strikeThrough") || computed?.textDecoration?.includes("line-through")),
        subscript: document.queryCommandState("subscript") || !!isElementInTag(anchorNode, "SUB"),
        superscript: document.queryCommandState("superscript") || !!isElementInTag(anchorNode, "SUP"),
        color: computed ? computed.color : null,
      });
    }
  };

  const handlePainterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (painterMode !== "off") {
      setPainterMode("off");
      setCopiedFormat(null);
    } else {
      captureFormatting();
      setPainterMode("single");
    }
  };

  const handlePainterDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    captureFormatting();
    setPainterMode("multi");
  };

  const handleEditorMouseUp = () => {
    updateActiveStates();
    if (painterMode === "off" || !copiedFormat) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      document.execCommand("removeFormat", false);

      if (copiedFormat.bold) document.execCommand("bold", false);
      if (copiedFormat.italic) document.execCommand("italic", false);
      if (copiedFormat.underline) document.execCommand("underline", false);
      if (copiedFormat.strike) document.execCommand("strikeThrough", false);
      if (copiedFormat.subscript) document.execCommand("subscript", false);
      if (copiedFormat.superscript) document.execCommand("superscript", false);
      if (copiedFormat.color) document.execCommand("foreColor", false, copiedFormat.color);

      handleInput();

      if (painterMode === "single") {
        setPainterMode("off");
        setCopiedFormat(null);
      }
    }
  };

  const handleClearFormatting = () => {
    document.execCommand("removeFormat", false);
    try {
      document.execCommand("formatBlock", false, "<P>");
    } catch {
      document.execCommand("formatBlock", false, "P");
    }
    handleInput();
  };

  const getBtnClass = (isActive?: boolean) =>
    `h-8 w-8 p-0 cursor-pointer transition-all rounded-md ${
      isActive
        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
    }`;

  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="rich-text-editor-container border border-default-200 dark:border-default-300 rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
      <EditorToolbar
        activeStates={activeStates}
        painterMode={painterMode}
        exec={exec}
        applyBlockFormat={applyBlockFormat}
        applyListFormat={applyListFormat}
        handleSubscript={handleSubscript}
        handleSuperscript={handleSuperscript}
        handleTextColor={handleTextColor}
        handlePainterClick={handlePainterClick}
        handlePainterDoubleClick={handlePainterDoubleClick}
        handleClearFormatting={handleClearFormatting}
        preventFocusLoss={preventFocusLoss}
        getBtnClass={getBtnClass}
        isLinkOpen={isLinkOpen}
        setIsLinkOpen={setIsLinkOpen}
        editingLinkNode={editingLinkNode}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        linkText={linkText}
        setLinkText={setLinkText}
        handleOpenLinkPopover={handleOpenLinkPopover}
        handleApplyLink={handleApplyLink}
        handleRemoveLink={handleRemoveLink}
      />

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={updateActiveStates}
        onMouseUp={handleEditorMouseUp}
        className={`rich-text-editor-area p-4 outline-none prose prose-sm dark:prose-invert max-w-none min-h-[200px] font-normal leading-relaxed overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none empty:before:float-left bg-transparent ${
          painterMode !== "off" ? "cursor-crosshair" : ""
        }`}
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
