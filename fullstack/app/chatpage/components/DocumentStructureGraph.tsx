"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import styles from "../page.module.css";
import DocumentFlow from "./DocumentFlow/DocumentFlow";

interface DocumentStructureProps {
  documentId: string | null;
  onNodeClick?: (
    headingText: string,
    documentId: string,
    pageReference?: number
  ) => void;
  isDarkTheme: boolean;
}

/**
 * DocumentStructureGraph component - Displays the document structure as a graph
 *
 * Flow:
 * 1. Document selection happens in DocumentList
 * 2. This component receives the selected documentId
 * 3. DocumentFlow component is rendered only when a document is selected
 * 4. DocumentFlow fetches structure data for the selected document only once
 */
const DocumentStructureGraph: React.FC<DocumentStructureProps> = ({
  documentId,
  onNodeClick,
  isDarkTheme,
}) => {
  // Handle node click in the document flow - memoized to prevent re-renders
  const handleDocumentNodeClick = useCallback(
    (headingText: string, docId: string, page: number) => {
      if (onNodeClick) {
        onNodeClick(headingText, docId, page);
        console.log(
          `Node clicked: ${headingText}, Document: ${docId}, Page: ${page}`
        );
      }
    },
    [onNodeClick]
  );

  // Only render DocumentFlow when documentId is provided
  const documentFlow = useMemo(() => {
    if (!documentId) {
      return (
        <div className={styles.noDocumentContainer || ""}>
          <div className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
            Select a document to view its structure
          </div>
        </div>
      );
    }

    return (
      <DocumentFlow
        documentId={documentId}
        onNodeClick={handleDocumentNodeClick}
        isDarkTheme={isDarkTheme}
        key={documentId} // Use key to force re-mount on document change
      />
    );
  }, [documentId, handleDocumentNodeClick, isDarkTheme]);

  useEffect(() => {
    // Add null checks before manipulating DOM elements
    const container = document.getElementById('graph-container');
    if (!container) return;
    
    // When cleaning up, make sure the element still exists
    return () => {
      const container = document.getElementById('graph-container');
      if (container && container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [documentId]);

  return (
    <div 
      className={styles.graphWrapper} 
      style={{ 
        backgroundColor: isDarkTheme ? '#1f2937' : 'white',
        height: '100%', 
        width: '100%' 
      }}
    >
      {documentFlow}
    </div>
  );
};

export default React.memo(DocumentStructureGraph);
