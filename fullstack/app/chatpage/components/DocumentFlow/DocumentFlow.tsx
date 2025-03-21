"use client";

import React, { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ConnectionLineType,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import styles from "./documentFlow.module.css";
import {
  DocumentFlowProps,
  DocumentNodeData,
  DocumentStructureResponse,
} from "@/app/types/documentStructure";
import { processDocumentStructure } from "./utils";

// API base URL from environment or default
const API_BASE_URL = "http://127.0.0.1:5002";

// Custom node component
const CustomNode = ({ data }: { data: DocumentNodeData }) => {
  const level = data.level || 0;
  const nodeClass = styles[`nodeLevel${level}`];

  return (
    <div className={nodeClass}>
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className={styles.targetHandle}
      />
      <div className={styles.nodeLabel} title={data.label}>
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className={styles.sourceHandle}
      />
    </div>
  );
};

// Node types registration - defined OUTSIDE of components and properly memoized
const nodeTypes = { custom: CustomNode };
// Edge types - also defined outside component
const edgeTypes = {};

// Stick defaults outside component to avoid recreation
const defaultViewport = { x: 0, y: 0, zoom: 0.8 };
const fitViewOptions = { padding: 0.2 };

// The internal flow component that has access to ReactFlow hooks
const DocumentFlowInternal: React.FC<DocumentFlowProps> = ({
  documentId,
  onNodeClick,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<DocumentNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // Use refs instead of state for loading and error to avoid re-renders
  const loadingRef = useRef<boolean>(false);
  const errorRef = useRef<string | null>(null);
  // Reference to track if component is mounted
  const isMountedRef = useRef<boolean>(true);
  // Track last loaded document ID to prevent duplicate loads
  const lastLoadedDocId = useRef<string | null>(null);
  const { fitView } = useReactFlow();

  // Reset loading and error display elements based on refs
  const setLoading = (isLoading: boolean) => {
    if (isMountedRef.current) {
      loadingRef.current = isLoading;
      // Force re-render without state updates
      document
        .querySelector(`#loading-indicator-${documentId}`)
        ?.classList.toggle("hidden", !isLoading);
    }
  };

  const setError = (errorMsg: string | null) => {
    if (isMountedRef.current) {
      errorRef.current = errorMsg;
      // Force re-render without state updates
      const errorEl = document.querySelector(`#error-container-${documentId}`);
      if (errorEl) {
        errorEl.classList.toggle("hidden", !errorMsg);
        if (errorMsg) {
          const msgEl = errorEl.querySelector(".error-message");
          if (msgEl) msgEl.textContent = errorMsg;
        }
      }
    }
  };

  // Load document structure - memoized with useCallback
  const loadDocumentStructure = useCallback(
    async (docId: string) => {
      // Skip if this document is already loading or is the same as last loaded
      if (loadingRef.current || docId === lastLoadedDocId.current) {
        console.log("Already loading or same document, skipping request");
        return;
      }

      console.log(`Loading document structure for ${docId}`);
      setLoading(true);
      setError(null);

      try {
        const apiUrl = `${API_BASE_URL}/api/structure/document/${docId}/structured`;
        console.log(`Fetching from: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!isMountedRef.current) return; // Prevent state updates if unmounted

        if (!response.ok) {
          throw new Error(
            `Failed to load document structure: ${response.status} ${response.statusText}`
          );
        }

        const data: DocumentStructureResponse = await response.json();
        console.log("Received document structure data:", data);

        if (!data.document_structure || data.document_structure.length === 0) {
          console.warn("Document structure is empty or invalid", data);
          setNodes([]);
          setEdges([]);
          setError("Document structure is empty");
          return;
        }

        // Process data to create nodes and edges using the utility function
        console.log("Processing document structure into nodes and edges");
        const { processedNodes, processedEdges } = processDocumentStructure(
          data,
          docId
        );

        console.log(
          `Created ${processedNodes.length} nodes and ${processedEdges.length} edges`
        );

        // Debug log some of the nodes and edges
        if (processedNodes.length > 0) {
          console.log("First node:", processedNodes[0]);
        }
        if (processedEdges.length > 0) {
          console.log("First edge:", processedEdges[0]);
        }

        setNodes(processedNodes);
        setEdges(processedEdges);
        lastLoadedDocId.current = docId;

        // After nodes are set, fit the view
        setTimeout(() => {
          if (isMountedRef.current) {
            console.log("Fitting view");
            fitView({ padding: 0.2 });
          }
        }, 100);
      } catch (err) {
        console.error("Error loading document structure:", err);

        // Create placeholder node for errors
        const placeholderNode: Node<DocumentNodeData> = {
          id: "placeholder",
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            id: "placeholder",
            label: "Document Structure Unavailable",
            level: 0,
            pageReference: 1,
          },
        };

        setNodes([placeholderNode]);
        setEdges([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error loading document structure"
        );
      } finally {
        setLoading(false);
      }
    },
    [fitView, setNodes, setEdges]
  );

  // Load document once when document ID changes with proper cleanup
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    const fetchDocumentStructure = async () => {
      if (
        documentId &&
        documentId !== lastLoadedDocId.current &&
        !loadingRef.current
      ) {
        await loadDocumentStructure(documentId);
      }
    };

    fetchDocumentStructure();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [documentId]); // Only depend on documentId to avoid re-runs

  // Handle node click - memoized to prevent recreating on render
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<DocumentNodeData>) => {
      if (onNodeClick && documentId) {
        onNodeClick(node.data.label, documentId, node.data.pageReference);
      }
    },
    [onNodeClick, documentId]
  );

  // Render loading, error, or flow content
  if (loadingRef.current) {
    return (
      <div
        className={styles.loadingContainer}
        id={`loading-indicator-${documentId}`}
      >
        <div>Loading document structure...</div>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (errorRef.current) {
    return (
      <div
        className={styles.errorContainer}
        id={`error-container-${documentId}`}
      >
        <div>Error loading document structure</div>
        <div className="error-message">{errorRef.current}</div>
        <button
          className={styles.retryButton}
          onClick={() => documentId && loadDocumentStructure(documentId)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!documentId) {
    return (
      <div className={styles.noDocumentContainer}>
        <div>Select a document to view its structure</div>
      </div>
    );
  }

  return (
    <div className={styles.flowContainer}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={defaultViewport}
        connectionLineType={ConnectionLineType.SmoothStep}
        className={styles.documentFlow}
        fitViewOptions={fitViewOptions}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeColor={() => "#3b82f6"}
          nodeColor={(n) => {
            const level = (n.data as DocumentNodeData)?.level || 0;
            switch (level) {
              case 0:
                return "#2563eb";
              case 1:
                return "#3b82f6";
              case 2:
                return "#60a5fa";
              case 3:
                return "#93c5fd";
              case 4:
                return "#bfdbfe";
              default:
                return "#dbeafe";
            }
          }}
          style={{
            backgroundColor: "#f9fafb",
          }}
        />
        <Panel position="bottom-left" className={styles.legend}>
          <div className={styles.legendTitle}>Heading Levels</div>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendLevel0}`}
            ></div>
            <div className={styles.legendText}>Document Title</div>
          </div>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendLevel1}`}
            ></div>
            <div className={styles.legendText}>Level 1 Heading</div>
          </div>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendLevel2}`}
            ></div>
            <div className={styles.legendText}>Level 2 Heading</div>
          </div>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendLevel3}`}
            ></div>
            <div className={styles.legendText}>Level 3 Heading</div>
          </div>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendLevel4}`}
            ></div>
            <div className={styles.legendText}>Level 4+ Heading</div>
          </div>
        </Panel>
        <Panel position="top-right">
          <button
            className={styles.retryButton}
            onClick={() => fitView({ duration: 800, padding: 0.2 })}
          >
            Reset View
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrap the component with ReactFlowProvider to access hooks
const DocumentFlow: React.FC<DocumentFlowProps> = React.memo((props) => {
  return (
    <ReactFlowProvider>
      <DocumentFlowInternal {...props} />
    </ReactFlowProvider>
  );
});

// Ensure component has a display name for better debugging
DocumentFlow.displayName = "DocumentFlow";

export default DocumentFlow;
