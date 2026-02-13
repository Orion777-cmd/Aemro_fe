"use client";

import { useState, useRef } from "react";
import { Document } from "@/app/lib/types";
import { formatFileSize, formatDate } from "@/app/lib/utils";

interface DocumentPickerProps {
  documents: Document[];
  selectedDocuments: Set<string>;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onUpload: (file: File) => Promise<void>;
}

export default function DocumentPicker({
  documents,
  selectedDocuments,
  onSelect,
  onDeselect,
  onUpload,
}: DocumentPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
    const allowedExtensions = [".pdf", ".txt", ".md"];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    const isValidType = allowedTypes.includes(file.type) || 
                       allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      alert("Please upload a PDF, TXT, or MD file.");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${
            isDragging
              ? "border-gold-500 bg-gold-900/20"
              : "border-gold-900/50 hover:border-gold-500/50 bg-gold-900/5"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
        <div className="space-y-2">
          <div className="text-gold-500 text-2xl">📄</div>
          <p className="text-sm text-gray-300">
            {isUploading ? "Uploading..." : "Click or drag to upload textbooks"}
          </p>
          <p className="text-xs text-gray-500">PDF, TXT, or MD files</p>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No textbooks uploaded yet. Upload your study materials to get started!
          </p>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDocuments.has(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() =>
                  isSelected ? onDeselect(doc.id) : onSelect(doc.id)
                }
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? "border-gold-500 bg-gold-900/20"
                      : "border-gold-900/30 hover:border-gold-500/50 bg-gold-900/5"
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-gold-500 border-gold-900/50 rounded focus:ring-gold-500"
                      />
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {doc.name}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
