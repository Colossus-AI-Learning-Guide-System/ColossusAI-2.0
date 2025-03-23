"use client";

import React, { useState, useEffect, useRef } from "react";

interface PDFViewerProps {
  fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalFile, setIsLocalFile] = useState(false);
  const objectRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    console.log("[PDFViewer] PDF URL changed:", fileUrl);
    setIsLoading(true);
    setError(null);

    if (!fileUrl) {
      console.error("[PDFViewer] No PDF URL provided");
      setError("No PDF URL provided");
      setIsLoading(false);
      return;
    }

    // Check if it's a local file path
    const isLocal = fileUrl.startsWith("/") || fileUrl.startsWith("./");
    setIsLocalFile(isLocal);
    console.log("[PDFViewer] Is local file:", isLocal, fileUrl);

    // Test if the file is accessible
    fetch(fileUrl, { method: "HEAD", cache: "no-cache" })
      .then((response) => {
        console.log(
          "[PDFViewer] Fetch HEAD response:",
          response.status,
          response.statusText
        );
        if (!response.ok) {
          setError(
            `File not accessible (${response.status}: ${response.statusText})`
          );
        }
      })
      .catch((err) => {
        console.error("[PDFViewer] Error checking file accessibility:", err);
      });

    // Set a timeout to simulate loading and check if PDF loaded
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      console.log(
        "[PDFViewer] Loading timeout completed, object status check bypassed"
      );
    }, 2000);

    return () => clearTimeout(loadTimer);
  }, [fileUrl]);

  const handleObjectError = () => {
    console.error("[PDFViewer] PDF object loading error event triggered");
    if (isLocalFile) {
      setError(
        `Could not load local PDF file. Please make sure that the file "${fileUrl}" exists in your public directory and that your browser supports PDF viewing.`
      );
    } else {
      setError(
        "Failed to load PDF document. The file might not be accessible or your browser doesn't support PDF viewing."
      );
    }
    setIsLoading(false);
  };

  const handleObjectLoad = () => {
    console.log("[PDFViewer] PDF object loaded successfully");
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="pdf-error-container">
        <div className="pdf-error-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="pdf-error-title">Error Loading PDF</h3>
        <p className="pdf-error-message">{error}</p>

        <div className="pdf-error-debug">
          <p>Debug Information:</p>
          <pre>File URL: {fileUrl}</pre>
          <pre>Local file: {isLocalFile ? "Yes" : "No"}</pre>
        </div>

        {isLocalFile && (
          <div className="pdf-error-help">
            <p>If you're using a local test PDF:</p>
            <ol>
              <li>
                Make sure you have created the directory{" "}
                <code>public/Sample_test_pdf/</code>
              </li>
              <li>
                Copy your <code>attention.pdf</code> file into this directory
              </li>
              <li>Restart the development server</li>
            </ol>
            <p>Try downloading a sample PDF using the button below:</p>
            <a
              href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
              download="attention.pdf"
              className="pdf-download-btn"
            >
              Download Sample PDF
            </a>
          </div>
        )}

        <style jsx>{`
          .pdf-error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
            height: 100%;
            min-height: 500px;
          }

          .pdf-error-icon {
            color: #ef4444;
            margin-bottom: 1rem;
          }

          .pdf-error-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #1f2937;
          }

          .pdf-error-message {
            color: #ef4444;
            margin-bottom: 1rem;
          }

          .pdf-error-debug {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.875rem;
            margin-bottom: 1rem;
            width: 100%;
            max-width: 500px;
            text-align: left;
          }

          .pdf-error-debug pre {
            margin: 0.25rem 0;
            white-space: pre-wrap;
            word-break: break-all;
          }

          .pdf-error-help {
            background-color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            width: 100%;
            max-width: 500px;
            text-align: left;
          }

          .pdf-error-help p {
            margin-bottom: 0.5rem;
            font-weight: 500;
          }

          .pdf-error-help ol {
            margin-left: 1.5rem;
          }

          .pdf-error-help li {
            margin-bottom: 0.5rem;
          }

          .pdf-error-help code {
            background-color: #e5e7eb;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-family: monospace;
          }

          .pdf-download-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: #3b82f6;
            color: white;
            border-radius: 0.25rem;
            text-decoration: none;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pdf-loading-container">
        <div className="pdf-loading-spinner"></div>
        <p>Loading PDF document...</p>
        <p className="pdf-loading-url">Attempting to load: {fileUrl}</p>
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

          .pdf-loading-url {
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 0.5rem;
            font-style: italic;
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

  // Fall back to an iframe as a more compatible alternative
  return (
    <div className="pdf-container">
      <iframe
        src={fileUrl}
        width="100%"
        height="100%"
        className="pdf-iframe"
        onLoad={handleObjectLoad}
        onError={handleObjectError}
      >
        <p>Your browser does not support iframes.</p>
      </iframe>
      <style jsx>{`
        .pdf-container {
          width: 100%;
          height: 100%;
          min-height: 600px;
          border-radius: 4px;
          overflow: hidden;
        }

        .pdf-iframe {
          border: none;
          width: 100%;
          height: 100%;
          min-height: 600px;
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;
