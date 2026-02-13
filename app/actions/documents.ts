"use server";

import { promises as fs } from "fs";
import path from "path";
import { Document } from "@/app/lib/types";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function uploadDocument(formData: FormData): Promise<Document> {
  await ensureUploadsDir();

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
  const allowedExtensions = [".pdf", ".txt", ".md"];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);

  if (!isValidType) {
    throw new Error("Invalid file type. Only PDF, TXT, and MD files are allowed.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await fs.writeFile(filePath, buffer);

  const document: Document = {
    id: fileName,
    name: file.name,
    type: file.type || fileExtension,
    size: file.size,
    uploadedAt: Date.now(),
  };

  return document;
}

export async function listDocuments(): Promise<Document[]> {
  await ensureUploadsDir();

  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const documents: Document[] = [];

    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const fileExtension = file.toLowerCase().substring(file.lastIndexOf("."));
        const allowedExtensions = [".pdf", ".txt", ".md"];

        if (allowedExtensions.includes(fileExtension)) {
          const originalName = file.substring(file.indexOf("-") + 1);
          documents.push({
            id: file,
            name: originalName,
            type: fileExtension,
            size: stats.size,
            uploadedAt: stats.mtimeMs,
          });
        }
      }
    }

    return documents.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch (error) {
    console.error("Error listing documents:", error);
    return [];
  }
}

export async function getDocumentContent(documentId: string): Promise<string> {
  await ensureUploadsDir();

  const filePath = path.join(UPLOADS_DIR, documentId);
  const fileExtension = documentId.toLowerCase().substring(documentId.lastIndexOf("."));

  try {
    if (fileExtension === ".pdf") {
      // PDF parsing requires additional libraries like pdf-parse
      // For now, return a placeholder message
      // To enable PDF parsing, install: npm install pdf-parse
      return `[PDF Document: ${documentId}]\n\nNote: PDF content extraction requires the pdf-parse library. Currently, only the document metadata is available.`;
    }

    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error reading document:", error);
    throw new Error("Failed to read document");
  }
}
