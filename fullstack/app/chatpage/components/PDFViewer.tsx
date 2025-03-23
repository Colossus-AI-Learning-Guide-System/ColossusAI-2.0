"use client";

import React, { useState, useEffect } from "react";

interface PDFViewerProps {
  fileUrl?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Always use the local sample PDF regardless of what's passed in
  const samplePdfUrl = "/Sample_test_pdf/attention.pdf";

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="pdf-container">
      <div className="pdf-header">
        <h3>Sample PDF Viewer</h3>
        <div className="pdf-actions">
          <a
            href={samplePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-button"
          >
            Open in New Tab
          </a>
        </div>
      </div>
      <div className="pdf-viewer">
        <iframe
          src={samplePdfUrl}
          title="PDF Viewer"
          className="pdf-iframe"
        ></iframe>
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
