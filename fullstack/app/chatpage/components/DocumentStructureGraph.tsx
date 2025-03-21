"use client";

import React, { useCallback, useMemo } from "react";
import styles from "../page.module.css";
import DocumentFlow from "./DocumentFlow/DocumentFlow";

interface DocumentStructureProps {
  documentId: string | null;
  onNodeClick?: (headingText: string, documentId: string) => void;
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
}) => {
  // Handle node click in the document flow - memoized to prevent re-renders
  const handleDocumentNodeClick = useCallback(
    (headingText: string, docId: string, page: number) => {
      if (onNodeClick) {
        onNodeClick(headingText, docId);
      }
    },
    [onNodeClick]
  );

  // Only render DocumentFlow when documentId is provided
  const documentFlow = useMemo(() => {
    if (!documentId) {
      return (
        <div className={styles.noDocumentContainer || ""}>
          <div>Select a document to view its structure</div>
        </div>
      );
    }

    return (
      <DocumentFlow
        documentId={documentId}
        onNodeClick={handleDocumentNodeClick}
        key={documentId} // Use key to force re-mount on document change
      />
    );
  }, [documentId, handleDocumentNodeClick]);

  return <div className={styles.graphWrapper}>{documentFlow}</div>;
};

export default React.memo(DocumentStructureGraph);
