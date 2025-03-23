"use client";

import React, { useState, useEffect } from "react";

interface PDFViewerProps {
  base64Pdf?: string;
  filename?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  base64Pdf,
  filename = "Document",
  isLoading = false,
  error = null,
  onRetry,
}) => {
  // Create a blob URL from the base64 PDF data
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Clean up previous URL if it exists
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    // Create a new URL if base64 data is provided
    if (base64Pdf) {
      try {
        console.log("Processing base64 PDF data, length:", base64Pdf.length);

        // Convert base64 to binary
        const binaryString = window.atob(base64Pdf);
        console.log("Binary string created, length:", binaryString.length);

        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create blob and URL
        const blob = new Blob([bytes], { type: "application/pdf" });
        console.log("Blob created, size:", blob.size);

        const url = URL.createObjectURL(blob);
        console.log("Blob URL created:", url);

        setPdfUrl(url);
      } catch (e) {
        console.error("Error processing base64 PDF data:", e);
      }
    }

    // Cleanup on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [base64Pdf]);

  if (isLoading) {
    return (
      <div className="pdf-loading-container">
        <div className="pdf-loading-spinner"></div>
        <p>Loading PDF document...</p>
        <style jsx>{`
          .pdf-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 500px;
          }

          .pdf-loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-error-container">
        <div className="pdf-error-icon">⚠️</div>
        <h3>Error Loading Document</h3>
        <p>{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="pdf-retry-button">
            Retry
          </button>
        )}
        <style jsx>{`
          .pdf-error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 500px;
            padding: 2rem;
            text-align: center;
            background-color: #fff5f5;
            color: #e53e3e;
          }

          .pdf-error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .pdf-retry-button {
            margin-top: 1rem;
            padding: 0.5rem 1.5rem;
            background-color: #3182ce;
            color: white;
            border: none;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .pdf-retry-button:hover {
            background-color: #2c5282;
          }
        `}</style>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="pdf-empty-container">
        <div className="pdf-empty-icon">📄</div>
        <h3>No Document Selected</h3>
        <p>Select a document from the document list to view its contents.</p>
        <style jsx>{`
          .pdf-empty-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 500px;
            padding: 2rem;
            text-align: center;
            background-color: #f7fafc;
            color: #4a5568;
          }

          .pdf-empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pdf-container">
      <div className="pdf-header">
        <h3>{filename}</h3>
        <div className="pdf-actions">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-button"
            >
              Open in New Tab
            </a>
          )}
        </div>
      </div>
      <div className="pdf-viewer">
        <iframe src={pdfUrl} title="PDF Viewer" className="pdf-iframe"></iframe>
      </div>
      <style jsx>{`
        .pdf-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .pdf-header {
          background-color: #f9fafb;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pdf-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%;
        }

        .pdf-actions {
          display: flex;
          gap: 0.5rem;
        }

        .pdf-button {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .pdf-button:hover {
          background-color: #e5e7eb;
        }

        .pdf-viewer {
          flex: 1;
          min-height: 600px;
          background-color: #f3f4f6;
        }

        .pdf-iframe {
          width: 100%;
          height: 100%;
          min-height: 600px;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;
