"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Star, ArrowLeft, ArrowRight, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  label?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  disabled,
  maxFiles = 10,
  label,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;
    const fileList = Array.from(files);

    if (value.length + fileList.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images in total.`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    fileList.forEach((file) => formData.append("file", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.urls)) {
        onChange([...value, ...data.urls]);
        toast.success(`Successfully uploaded ${data.urls.length} image(s).`);
      } else {
        toast.error(data.error || "Failed to upload image(s).");
      }
    } catch (err) {
      toast.error("Network error while uploading images.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = value[index];
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);

    if (urlToRemove) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToRemove }),
        });
        toast.success("Image deleted from storage.");
      } catch (err) {
        console.warn("Failed to delete image from storage server:", err);
      }
    }
  };


  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= value.length) return;

    const newUrls = [...value];
    const temp = newUrls[index];
    newUrls[index] = newUrls[targetIndex];
    newUrls[targetIndex] = temp;
    onChange(newUrls);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
        } ${disabled || isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Uploading images to storage...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Click to upload or drag & drop images
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, WEBP, GIF up to 5MB (Max {maxFiles} images)
              </p>
            </div>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label || "Images"} ({value.length} / {maxFiles})
            </span>
            <span className="text-xs text-muted-foreground italic">
              First image will be used as primary thumbnail
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {value.map((url, index) => (
              <div
                key={url + index}
                className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted/20 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                  }}
                />

                {index === 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" /> Main
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-1.5">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="icon"
                      color="destructive"
                      className="h-7 w-7 rounded-full cursor-pointer opacity-90 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      color="secondary"
                      className="h-6 w-6 rounded bg-black/60 text-white hover:bg-black/80 cursor-pointer disabled:opacity-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, "left");
                      }}
                      disabled={disabled || index === 0}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      color="secondary"
                      className="h-6 w-6 rounded bg-black/60 text-white hover:bg-black/80 cursor-pointer disabled:opacity-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, "right");
                      }}
                      disabled={disabled || index === value.length - 1}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
