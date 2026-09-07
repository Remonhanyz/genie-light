"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Download } from "lucide-react";
import { Button } from "./button";

interface BarcodeProps {
  value: string;
  format?: "CODE128" | "CODE39" | "EAN13" | "UPC";
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  className?: string;
  showDownload?: boolean;
}

export function Barcode({
  value,
  format = "CODE128",
  width = 1.8,
  height = 50,
  displayValue = true,
  fontSize = 12,
  margin = 10,
  className = "",
  showDownload = false,
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontSize,
          margin,
          fontOptions: "bold",
          font: "monospace",
          textMargin: 4,
          lineColor: "#000000",
        });
      } catch (err) {
        console.error("Barcode generation error:", err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin]);

  const downloadSVG = () => {
    if (!svgRef.current) return;
    try {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgRef.current);
      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `barcode-${value}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } catch (err) {
      console.error("Failed to download barcode as SVG:", err);
    }
  };

  const downloadPNG = () => {
    if (!svgRef.current) return;
    try {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgRef.current);
      const canvas = document.createElement("canvas");
      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width || 250;
        canvas.height = img.height || 100;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `barcode-${value}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error("Failed to download barcode as PNG:", err);
    }
  };

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 p-2 bg-white rounded-md border border-default-200 ${className}`}>
      <svg ref={svgRef} className="max-w-full" />
      {showDownload && (
        <div className="flex gap-2 w-full justify-center">
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={downloadSVG}>
            SVG
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={downloadPNG}>
            PNG
          </Button>
        </div>
      )}
    </div>
  );
}

// Utility function to trigger download of SVG from external references (e.g., in a table)
export function triggerBarcodeDownload(value: string, format: string = "CODE128") {
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  try {
    JsBarcode(tempSvg, value, {
      format,
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 18,
      textMargin: 5,
      font: "monospace",
      fontOptions: "bold",
    });
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(tempSvg);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `barcode-${value}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  } catch (err) {
    console.error("Failed to download barcode:", err);
  }
}
