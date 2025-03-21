"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../page.module.css";

interface DocumentStructureProps {
  documentId: string | null;
  onNodeClick?: (headingText: string, documentId: string) => void;
}

const DocumentStructureGraph: React.FC<DocumentStructureProps> = ({
  documentId,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset states when document ID changes
  useEffect(() => {
    if (documentId) {
      setLoading(true);
      setError(null);

      // Simulate a brief loading state
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [documentId]);

  // Render placeholder content
  const renderPlaceholder = () => {
    return (
      <div className={styles.messageContainer}>
        <p>Document structure visualization will be implemented soon</p>
        {documentId && (
          <p className={styles.smallText}>
            Document ID: {documentId.substring(0, 8)}...
          </p>
        )}
      </div>
    );
  };

  // Main render content based on state
  const graphContent = () => {
    if (!documentId) {
      return (
        <div className={styles.messageContainer}>
          <p>Select a document to view its structure</p>
        </div>
      );
    }

    // Container that will hold the future graph implementation
    const chartContainerElement = (
      <div className={`${styles.chartContainerWrapper}`}>
        <div
          key={`chart-container-${documentId}`}
          ref={containerRef}
          className={styles.graph}
          style={{
            background: "#f9f9f9",
            border: "1px solid #eee",
            borderRadius: "8px",
            width: "100%",
            height: "100%",
          }}
          data-document-id={documentId}
        >
          {renderPlaceholder()}
        </div>
        <div
          className={styles.chartInfo}
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            padding: "5px",
            borderRadius: "4px",
            fontSize: "10px",
          }}
        >
          Document ID:{" "}
          {documentId ? documentId.substring(0, 8) + "..." : "none"}
        </div>
      </div>
    );

    // Overlay loading or error state on top of the chart container
    if (loading) {
      return (
        <>
          {chartContainerElement}
          <div
            className={styles.loadingContainer}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            }}
          >
            <div className={styles.loadingSpinner}></div>
            <p>Loading document structure...</p>
          </div>
        </>
      );
    }

    if (error) {
      return (
        <>
          {chartContainerElement}
          <div
            className={styles.errorContainer}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            }}
          >
            <p className={styles.errorTitle}>Document Structure Unavailable</p>
            <p className={styles.errorMessage}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => {
                if (documentId) {
                  setLoading(true);
                  setError(null);
                  // Simulate retry with timeout
                  setTimeout(() => setLoading(false), 1000);
                }
              }}
            >
              Retry
            </button>
          </div>
        </>
      );
    }

    return chartContainerElement;
  };

  // Main render
  return <div className={styles.graphWrapper}>{graphContent()}</div>;
};

export default React.memo(DocumentStructureGraph);
