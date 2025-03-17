"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import {
  PaperclipIcon,
  SendIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Sidebar } from "@/app/components/ui/sidebar";
import Image from "next/image";

// Add API base URL constant at the top of the file
const API_BASE_URL = "http://127.0.0.1:5002";

// Define RequestOptions interface
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Define the interface for the graph ref
interface GraphRef {
  zoomIn: () => void;
  zoomOut: () => void;
  fitAll: () => void;
  updateData: (data: any) => void;
}

// Define interfaces for backend data
interface DocumentMetadata {
  id: string;
  name: string;
  upload_date: string;
  page_count: number;
  status: string;
}

interface DocumentNode {
  id: string;
  label: string;
  type: string;
  level: number;
  page: number;
}

interface DocumentEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

interface DocumentStructure {
  id: string;
  name: string;
  nodes: DocumentNode[];
  edges: DocumentEdge[];
  page_count?: number;
}

interface Citation {
  doc_id: string;
  page_num: number;
  score: number;
  metadata: {
    text: string;
    title: string;
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HighlightSection {
  id: string;
  page: number;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface NodeData {
  name: string;
  value: number;
  id?: string;
  children?: NodeData[];
  documentId?: string;
  type?: string;
  page?: number;
}

// Import ForceDirectedGraph with dynamic import to avoid SSR issues
const ForceDirectedGraph = dynamic(
  () => import("./components/ForceDirectedGraph"),
  {
    ssr: false,
  }
);

// Sample document pages for initial state
const sampleDocumentPages = [
  "/sample-pdf-page-1.png",
  "/sample-pdf-page-2.png",
  "/sample-pdf-page-3.png",
];

export default function DocumentAnalysisPage() {
  // Reference to the graph component
  const graphRef = useRef<GraphRef>(null);

  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I can help you analyze your documents. Upload a file or ask me a question.",
    },
  ]);

  // State for user input
  const [userInput, setUserInput] = useState("");

  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for document viewer
  const [currentPage, setCurrentPage] = useState(0);
  const [documentPages, setDocumentPages] =
    useState<string[]>(sampleDocumentPages);
  const [totalPages, setTotalPages] = useState(sampleDocumentPages.length);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [loadedDocument, setLoadedDocument] = useState<string | null>(null);
  const [highlightedSections, setHighlightedSections] = useState<
    HighlightSection[]
  >([]);
  const viewerRef = useRef<HTMLDivElement>(null);

  // State for document management
  const [availableDocuments, setAvailableDocuments] = useState<
    DocumentMetadata[]
  >([]);
  const [activeDocuments, setActiveDocuments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Add new state variables for graph data and loading state
  const [graphData, setGraphData] = useState<NodeData | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [lastPollTime, setLastPollTime] = useState<number>(0);
  const POLL_INTERVAL = 5000; // Poll every 5 seconds

  // Update the apiRequest helper function
  const apiRequest = async (url: string, options: RequestOptions = {}) => {
    try {
      console.log(`Attempting to connect to: ${API_BASE_URL}${url}`);
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => null);
        console.error("Error response:", errorData);
        throw new Error(
          errorData?.message ||
            `API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Successfully received data:", data);
      return data;
    } catch (error: any) {
      console.error(`API request failed for ${url}:`, error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Handle network errors
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error(
          `Unable to connect to the server at ${API_BASE_URL}. Please check if the server is running.`
        );
      }

      // Re-throw to allow component-specific handling
      throw error;
    }
  };

  // Load available documents on component mount
  useEffect(() => {
    loadDocumentStructure();
  }, []);

  // Load document structure data for graph visualization
  const loadDocumentStructure = async () => {
    try {
      // First get list of available documents
      const data = await apiRequest("/api/structure/documents");

      setAvailableDocuments(data.documents);

      // If we have documents, load the first one's structure
      if (data.documents && data.documents.length > 0) {
        const firstDoc = data.documents[0];
        loadDocumentGraph(firstDoc.id);
        setActiveDocuments([firstDoc.id]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  // Load document graph data
  const loadDocumentGraph = async (documentId: string) => {
    try {
      const data = await apiRequest(`/api/structure/document/${documentId}`);

      // Transform the data for the graph component
      const graphData = transformToGraphFormat(data);

      // Update the graph
      if (graphRef.current) {
        graphRef.current.updateData(graphData);
      }

      setSelectedDocument(documentId);
    } catch (error) {
      console.error("Error loading document graph:", error);
    }
  };

  // Add polling effect for document updates
  useEffect(() => {
    let pollTimeout: NodeJS.Timeout;
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 3;

    const pollForDocuments = async () => {
      if (!isPolling) return;

      try {
        const data = await apiRequest("/api/structure/documents");
        const currentTime = Date.now();

        // Check if there are new documents since last poll
        if (data.documents && data.documents.length > 0) {
          const hasNewDocuments = data.documents.some(
            (doc: DocumentMetadata) => {
              const uploadTime = new Date(doc.upload_date).getTime();
              return uploadTime > lastPollTime;
            }
          );

          if (hasNewDocuments) {
            // Update available documents
            setAvailableDocuments(data.documents);

            // Load graph data for all documents
            const graphPromises = data.documents.map((doc: DocumentMetadata) =>
              apiRequest(`/api/structure/document/${doc.id}`)
            );

            const graphResults = await Promise.all(graphPromises);

            // Combine all document structures into one graph
            const combinedGraphData = combineDocumentGraphs(graphResults);
            setGraphData(combinedGraphData);

            // Update active documents
            setActiveDocuments(
              data.documents.map((doc: DocumentMetadata) => doc.id)
            );
          }
        }

        setLastPollTime(currentTime);
        pollAttempts = 0; // Reset poll attempts on successful request
      } catch (error: any) {
        console.error("Polling error:", error);
        pollAttempts++;

        // Show error message to user
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error connecting to server: ${error.message}`,
          },
        ]);

        // Stop polling after max attempts
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Unable to connect to the server. Please check if the server is running and try again.",
            },
          ]);
          setIsPolling(false);
          return;
        }
      }

      // Schedule next poll
      pollTimeout = setTimeout(pollForDocuments, POLL_INTERVAL);
    };

    // Start polling
    pollForDocuments();

    return () => {
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
      setIsPolling(false);
    };
  }, [isPolling, lastPollTime]);

  // Function to combine multiple document graphs into one
  const combineDocumentGraphs = (documents: DocumentStructure[]): NodeData => {
    const rootNode: NodeData = {
      name: "All Documents",
      value: 0,
      children: [],
    };

    documents.forEach((doc) => {
      // Transform document structure to graph format
      const docGraph = transformToGraphFormat(doc);
      if (docGraph.children && docGraph.children.length > 0) {
        rootNode.children?.push(...docGraph.children);
      }
    });

    return rootNode;
  };

  // Update transformToGraphFormat function
  const transformToGraphFormat = (data: DocumentStructure): NodeData => {
    if (!data || !data.nodes || !data.edges) {
      return {
        name: "Empty Document",
        value: 0,
        children: [],
      };
    }

    // Create a map of nodes by ID
    const nodesMap = new Map();

    // Add all nodes to the map
    data.nodes.forEach((node) => {
      nodesMap.set(node.id, {
        name: node.label || "Untitled Node",
        value: 1,
        id: node.id,
        documentId: data.id,
        type: node.type,
        page: node.page,
        children: [],
      });
    });

    // Build the tree structure based on edges
    data.edges.forEach((edge) => {
      const source = nodesMap.get(edge.source);
      const target = nodesMap.get(edge.target);

      if (source && target) {
        source.children.push(target);
      }
    });

    // Find root nodes (nodes that are not targets in any edge)
    const targetIds = new Set(data.edges.map((edge) => edge.target));
    const rootNodes = Array.from(nodesMap.values()).filter(
      (node) => !targetIds.has(node.id)
    );

    // Return the graph data structure
    return {
      name: data.name || "Untitled Document",
      value: 0,
      id: data.id,
      children:
        rootNodes.length > 0 ? rootNodes : Array.from(nodesMap.values()),
    };
  };

  // Update handleFileUpload function to properly log and handle the upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Add message about upload starting
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Starting upload of "${file.name}"...`,
        },
      ]);

      console.log(
        `Uploading file "${file.name}" to ${API_BASE_URL}/api/document/upload`
      );

      const response = await fetch(`${API_BASE_URL}/api/document/upload`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header, let the browser set it with the boundary
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Upload error response:", errorData);
        throw new Error(
          errorData?.message ||
            `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Upload success response:", data);

      // Add message about upload success
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Document "${file.name}" uploaded successfully. Processing has started...`,
        },
      ]);

      // Store document_id for status polling
      if (data.document_id) {
        // Start polling for document status
        pollDocumentStatus(data.document_id);
        // Force an immediate poll for new documents
        setLastPollTime(0);
      } else {
        throw new Error("No document ID received from server");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, there was an error uploading your document: ${
            error.message || "Unknown error"
          }`,
        },
      ]);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  // Update handleFileChange function
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type if needed
      if (
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setSelectedFile(file);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Please upload a PDF or Word document.",
          },
        ]);
      }
    }
  };

  // Update handleSendMessage function to handle file uploads
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle file upload
    if (selectedFile) {
      await handleFileUpload(selectedFile);
      return;
    }

    if (!userInput.trim()) return;

    // Add user message to UI
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userInput },
    ];
    setMessages(newMessages);

    const currentInput = userInput;
    setUserInput("");

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/query/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: currentInput,
          document_ids: activeDocuments,
          k: 4, // Number of results to return
        }),
      });

      const data = await response.json();

      // Format the response with citations
      let formattedResponse = data.answer;

      if (data.citations && data.citations.length > 0) {
        formattedResponse += "\n\nSources:";
        data.citations.forEach((citation: Citation, index: number) => {
          formattedResponse += `\n[${index + 1}] ${
            citation.metadata.title
          }, Page ${citation.page_num}`;
        });
      }

      // Add assistant response to UI
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: formattedResponse,
        },
      ]);

      // If there are citations, ensure the documents are loaded
      if (data.citations && data.citations.length > 0) {
        const citedDocIds = new Set(
          data.citations.map((c: Citation) => c.doc_id)
        );

        // Load the first cited document if not already loaded
        const firstCitation = data.citations[0];
        if (firstCitation && firstCitation.doc_id) {
          handleCitationClick(firstCitation.doc_id, firstCitation.page_num);
        }
      }
    } catch (error) {
      console.error("Query error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle citation click from chat
  const handleCitationClick = (documentId: string, page: number) => {
    setSelectedDocument(documentId);

    // Load document if not already loaded
    if (!activeDocuments.includes(documentId)) {
      setActiveDocuments((prev) => [...prev, documentId]);
      // Load document structure
      loadDocumentGraph(documentId);
    }

    // Load document pages
    if (loadedDocument !== documentId) {
      loadDocumentPages(documentId);
    }

    // Set the page
    setCurrentPage(page - 1); // Convert 1-indexed to 0-indexed
  };

  // Handle node click from graph
  const handleNodeClick = (
    nodeId: string,
    documentId: string,
    page: number
  ) => {
    setSelectedDocument(documentId);

    // Load document pages if needed
    if (loadedDocument !== documentId) {
      loadDocumentPages(documentId);
    }

    // Set the page
    setCurrentPage(page);

    // Highlight the selected section
    setHighlightedSections([
      {
        id: nodeId,
        page: page,
        // You'd need to get actual coordinates from backend
        rect: { x: 100, y: 100, width: 300, height: 50 },
      },
    ]);
  };

  // Load document pages
  const loadDocumentPages = async (documentId: string) => {
    try {
      // Get document metadata to know page count
      const data = await apiRequest(`/api/structure/document/${documentId}`);

      const pageCount = data.page_count || 10; // Default if not provided

      // Pre-load first few pages
      const pagesToPreload = Math.min(5, pageCount);
      const pages = new Array(pageCount).fill(null);

      for (let i = 0; i < pagesToPreload; i++) {
        const pageUrl = `/api/document/${documentId}/page/${i}`;
        pages[i] = pageUrl;
      }

      setDocumentPages(pages);
      setTotalPages(pageCount);
      setCurrentPage(0);
      setLoadedDocument(documentId);
    } catch (error) {
      console.error("Error loading document pages:", error);
    }
  };

  // Load a specific page when needed (for lazy loading)
  const loadPage = async (pageNumber: number) => {
    if (!loadedDocument || documentPages[pageNumber]) {
      // No document loaded or page already loaded
      return;
    }

    try {
      const pageUrl = `/api/document/${loadedDocument}/page/${pageNumber}`;

      // Update the pages array with the new page
      const updatedPages = [...documentPages];
      updatedPages[pageNumber] = pageUrl;

      setDocumentPages(updatedPages);
    } catch (error) {
      console.error(`Error loading page ${pageNumber}:`, error);
    }
  };

  // Ensure the current page is loaded
  useEffect(() => {
    if (loadedDocument && currentPage >= 0 && currentPage < totalPages) {
      loadPage(currentPage);

      // Preload next page
      if (currentPage + 1 < totalPages) {
        loadPage(currentPage + 1);
      }

      // Preload previous page
      if (currentPage - 1 >= 0) {
        loadPage(currentPage - 1);
      }
    }
  }, [loadedDocument, currentPage, totalPages]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoomOut();
    }
  };

  const handleFitAll = () => {
    if (graphRef.current) {
      graphRef.current.fitAll();
    }
  };

  // Document viewer handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDocumentZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleDocumentZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!loadedDocument) return;

    // Create a download link for the current page
    const link = document.createElement("a");
    link.href = documentPages[currentPage] || "";
    link.download = `document-${loadedDocument}-page-${currentPage + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Update pollDocumentStatus function
  const pollDocumentStatus = async (documentId: string) => {
    let pollCount = 0;
    const maxPolls = 60; // Maximum number of polls (2 minutes with 2-second interval)

    const statusCheck = async () => {
      try {
        const data = await apiRequest(
          `/api/document/indexing-status/${documentId}`
        );

        // Update progress
        setUploadProgress(data.progress || 0);

        if (data.status === "completed") {
          // Update UI to show document is ready
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Document processed successfully. You can now ask questions about it!`,
            },
          ]);

          // Add to active documents
          setActiveDocuments((prev) => [...prev, documentId]);

          // Refresh document list and graph
          loadDocumentStructure();

          // Stop polling
          return;
        } else if (data.status === "failed") {
          // Show error message
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Document processing failed: ${
                data.message || "Unknown error"
              }`,
            },
          ]);
          // Stop polling
          return;
        }

        // Check if we should continue polling
        pollCount++;
        if (pollCount < maxPolls) {
          // Continue polling
          setTimeout(statusCheck, 2000);
        } else {
          // Stop polling after max attempts
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Document processing timed out. Please try uploading again.",
            },
          ]);
        }
      } catch (error) {
        console.error("Status polling error:", error);
        // Stop polling on error
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Error checking document status. Please try uploading again.",
          },
        ]);
      }
    };

    statusCheck();
  };

  return (
    <main className="chatpage-container" style={{ width: "100%" }}>
      <Sidebar />
      <div
        className="content-wrapper"
        style={{
          marginLeft: "3.05rem",
          width: "calc(100% - 3.05rem)",
          transition: "margin-left 0.2s ease",
        }}
      >
        <div className={styles["papers-container"]}>
          {/* Chatbot Conversation Container */}
          <div className={styles.panel + " " + styles["chatbot-panel"]}>
            <div className={styles["panel-header"]}>
              <h2>AI Document Assistant</h2>
            </div>
            <div className={styles["chat-container"]}>
              <div className={styles["messages-list"]}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${styles["message"]} ${styles[message.role]}`}
                  >
                    <div className={styles["message-content"]}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div
                    className={`${styles["message"]} ${styles["assistant"]}`}
                  >
                    <div className={styles["message-content"]}>
                      <div className={styles["typing-indicator"]}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                {isUploading && (
                  <div
                    className={`${styles["message"]} ${styles["assistant"]}`}
                  >
                    <div className={styles["message-content"]}>
                      <div className={styles["upload-progress"]}>
                        <div
                          className={styles["upload-progress-bar"]}
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <div className={styles["upload-progress-text"]}>
                          Processing: {uploadProgress}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles["chat-input-container"]}>
                <form
                  onSubmit={handleSendMessage}
                  className={styles["chat-form"]}
                >
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={
                      selectedFile
                        ? `Upload: ${selectedFile.name}`
                        : "Ask about your documents..."
                    }
                    className={styles["chat-input"]}
                    disabled={isUploading}
                  />
                  <div className={styles["file-upload"]}>
                    <label
                      htmlFor="file-upload"
                      className={`${styles["file-upload-label"]} ${
                        selectedFile ? styles["file-selected"] : ""
                      }`}
                      title={selectedFile ? selectedFile.name : "Attach file"}
                    >
                      <PaperclipIcon size={16} />
                      <span className={styles["sr-only"]}>Attach file</span>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className={styles["file-input"]}
                      disabled={isUploading}
                    />
                  </div>
                  <button
                    type="submit"
                    className={styles["send-button"]}
                    title={selectedFile ? "Upload file" : "Send message"}
                    disabled={
                      isUploading || (!userInput.trim() && !selectedFile)
                    }
                  >
                    <SendIcon size={16} />
                    <span className={styles["sr-only"]}>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Graph Visualization Panel */}
          <div className={styles.panel + " " + styles["graph-panel"]}>
            <div className={styles["panel-header"]}>
              <h2>Document Connections</h2>
              <div className={styles["graph-controls"]}>
                <div className={styles["view-toggles"]}>
                  <button
                    className={styles["view-toggle"] + " " + styles.active}
                  >
                    Network
                  </button>
                  <button className={styles["view-toggle"]}>Timeline</button>
                </div>
                <div className={styles["label-toggles"]}>
                  <button className={styles["label-toggle"]}>Categories</button>
                  <button className={styles["label-toggle"]}>Keywords</button>
                </div>
              </div>
            </div>
            <div className={styles["graph-container"]}>
              {graphData ? (
                <ForceDirectedGraph
                  ref={graphRef}
                  onNodeClick={handleNodeClick}
                  data={graphData}
                />
              ) : (
                <div className={styles["graph-placeholder"]}>
                  <p>Upload a document to visualize connections</p>
                </div>
              )}
            </div>
            {graphData && (
              <div className={styles["graph-zoom-controls"]}>
                <button className={styles["zoom-btn"]} onClick={handleZoomOut}>
                  Zoom Out
                </button>
                <button className={styles["zoom-btn"]} onClick={handleFitAll}>
                  Fit All
                </button>
                <button className={styles["zoom-btn"]} onClick={handleZoomIn}>
                  Zoom In
                </button>
              </div>
            )}
          </div>

          {/* Modern Document Viewer Panel */}
          <div
            className={styles.panel + " " + styles["document-viewer-panel"]}
            ref={viewerRef}
          >
            <div className={styles["panel-header"]}>
              <h2>Document Viewer</h2>
              <div className={styles["document-controls"]}>
                <button
                  className={styles["document-control-btn"]}
                  onClick={handleDocumentZoomOut}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className={styles["zoom-level"]}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  className={styles["document-control-btn"]}
                  onClick={handleDocumentZoomIn}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  className={styles["document-control-btn"]}
                  onClick={handleRotate}
                  title="Rotate"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  className={styles["document-control-btn"]}
                  onClick={handleDownload}
                  title="Download"
                  disabled={!loadedDocument}
                >
                  <Download size={16} />
                </button>
                <button
                  className={styles["document-control-btn"]}
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>

            <div className={styles["document-viewer-container"]}>
              {/* Document display area */}
              <div
                className={styles["document-display"]}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: "transform 0.3s ease",
                }}
              >
                {loadedDocument && documentPages[currentPage] ? (
                  <div className={styles["document-image-container"]}>
                    <Image
                      src={documentPages[currentPage]}
                      alt={`Document page ${currentPage + 1}`}
                      width={800}
                      height={1100}
                      className={styles["document-image"]}
                      priority
                    />

                    {/* Overlay for annotations or highlights */}
                    <div className={styles["document-overlay"]}>
                      {highlightedSections.map(
                        (section, index) =>
                          section.page === currentPage && (
                            <div
                              key={index}
                              className={styles["highlight"]}
                              style={{
                                left: `${section.rect.x}px`,
                                top: `${section.rect.y}px`,
                                width: `${section.rect.width}px`,
                                height: `${section.rect.height}px`,
                              }}
                            ></div>
                          )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles["document-placeholder"]}>
                    <p>
                      {loadedDocument
                        ? "Loading document..."
                        : "Select a document from the graph or upload a file to view"}
                    </p>
                  </div>
                )}
              </div>

              {/* Page navigation */}
              <div className={styles["page-navigation"]}>
                <button
                  className={styles["page-nav-btn"]}
                  onClick={handlePrevPage}
                  disabled={!loadedDocument || currentPage === 0}
                  title="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className={styles["page-indicator"]}>
                  {loadedDocument
                    ? `Page ${currentPage + 1} of ${totalPages}`
                    : "No document loaded"}
                </div>
                <button
                  className={styles["page-nav-btn"]}
                  onClick={handleNextPage}
                  disabled={!loadedDocument || currentPage === totalPages - 1}
                  title="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Thumbnail navigation */}
              {loadedDocument && (
                <div className={styles["thumbnail-navigation"]}>
                  {documentPages.map((page, index) => (
                    <div
                      key={index}
                      className={`${styles["thumbnail"]} ${
                        currentPage === index ? styles["active"] : ""
                      }`}
                      onClick={() => setCurrentPage(index)}
                    >
                      {page ? (
                        <Image
                          src={page}
                          alt={`Thumbnail ${index + 1}`}
                          width={60}
                          height={80}
                          className={styles["thumbnail-image"]}
                        />
                      ) : (
                        <div className={styles["thumbnail-placeholder"]}>
                          {index + 1}
                        </div>
                      )}
                      <span className={styles["thumbnail-number"]}>
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
