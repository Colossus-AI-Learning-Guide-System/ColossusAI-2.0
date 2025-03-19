"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import Image from "next/image";
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
  FileText,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Sidebar } from "@/app/components/ui/sidebar";
import DocumentStructureGraph from "./components/DocumentStructureGraph";
import DocumentList from "../components/DocumentList";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
// Temporarily comment out these imports until we can install them or find alternatives
// import { useChat } from "ai/react";
// import Markdown from "react-markdown";

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
    useState<(string | null)[]>(sampleDocumentPages);
  const [totalPages, setTotalPages] = useState(sampleDocumentPages.length);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
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

  // Add new state for tracking the current heading
  const [currentHeading, setCurrentHeading] = useState<string | null>(null);
  const [headingLoading, setHeadingLoading] = useState<boolean>(false);

  // Add new state for tracking pages with errors
  const [pagesWithErrors, setPagesWithErrors] = useState<
    Record<number, boolean>
  >({});

  // Add these state variables near the other state declarations
  const [documentLoading, setDocumentLoading] = useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

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
    // Remove the call to loadDocumentStructure() since DocumentList.tsx will now handle document loading
  }, []);

  // Keep the transformToGraphFormat function which is still used for visualization
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

  // Helper function to convert headings/hierarchy format to nodes/edges format
  const convertHeadingsToGraphFormat = (
    data: any,
    documentId: string
  ): DocumentStructure => {
    const { headings, hierarchy } = data;

    // Handle empty data case
    if (!headings || headings.length === 0) {
      console.warn("No headings found in document structure");
      return {
        id: documentId,
        name: "Document with No Headings",
        nodes: [],
        edges: [],
      };
    }

    // Create nodes for document root
    const documentNode: DocumentNode = {
      id: `doc-${documentId}`,
      label: "Document Root",
      type: "document",
      level: 0,
      page: 1,
    };

    const nodes: DocumentNode[] = [documentNode];
    const edges: DocumentEdge[] = [];

    // Create nodes for each heading
    headings.forEach((heading: string, index: number) => {
      const headingId = `heading-${index}`;
      // Add heading node
      nodes.push({
        id: headingId,
        label: heading,
        type: "heading",
        level: 1,
        page: 1, // Default to page 1 if unknown
      });

      // Connect heading to document
      edges.push({
        source: documentNode.id,
        target: headingId,
        weight: 1,
        type: "contains",
      });

      // Add subheadings if they exist
      if (
        hierarchy[heading] &&
        Array.isArray(hierarchy[heading]) &&
        hierarchy[heading].length > 0
      ) {
        hierarchy[heading].forEach((subheading: string, subIndex: number) => {
          const subheadingId = `subheading-${index}-${subIndex}`;

          // Add subheading node
          nodes.push({
            id: subheadingId,
            label: subheading,
            type: "subheading",
            level: 2,
            page: 1, // Default to page 1 if unknown
          });

          // Connect subheading to its parent heading
          edges.push({
            source: headingId,
            target: subheadingId,
            weight: 1,
            type: "contains",
          });
        });
      }
    });

    return {
      id: documentId,
      name: `Document ${documentId}`,
      nodes,
      edges,
    };
  };

  // Update handleFileUpload function
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
          content: `Document "${file.name}" uploaded successfully!`,
        },
      ]);

      // No more polling, just set progress to 100%
      setUploadProgress(100);

      if (data.document_id) {
        // Add to active documents
        setActiveDocuments((prev) => [...prev, data.document_id]);

        // Set the uploaded document as selected
        setSelectedDocumentId(data.document_id);

        // No need to poll, we assume document is ready
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

  // Update handleSendMessage function - only remove references to polling
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

  // Update handleCitationClick function to use DocumentStructureGraph directly
  const handleCitationClick = (documentId: string, page: number) => {
    setSelectedDocumentId(documentId);

    // Load document if not already loaded
    if (!activeDocuments.includes(documentId)) {
      setActiveDocuments((prev) => [...prev, documentId]);
    }

    // Load document pages
    if (loadedDocument !== documentId) {
      loadDocumentPages(documentId);
    }

    // Set the page
    setCurrentPage(page - 1); // Convert 1-indexed to 0-indexed
  };

  // Update handleNodeClick function to set the selected document
  const handleNodeClick = (
    nodeId: string,
    documentId: string,
    page: number
  ) => {
    console.log(
      `Node clicked: ${nodeId}, Document: ${documentId}, Page: ${page}`
    );
    setSelectedDocumentId(documentId);
    loadDocument(documentId, page);
  };

  // Simplify loadDocumentPages function to not depend on structure API
  const loadDocumentPages = async (documentId: string) => {
    if (!documentId) {
      console.error("No document ID provided to loadDocumentPages");
      return;
    }

    console.log(`Loading document pages for document ID: ${documentId}`);

    try {
      // Show loading state
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Loading document...",
        },
      ]);

      // Instead of getting document metadata from structure API,
      // we'll use a direct API call to get page count
      const response = await fetch(
        `${API_BASE_URL}/api/document/${documentId}/info`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get document info: ${response.status}`);
      }

      const data = await response.json();

      if (!data) {
        throw new Error("No data returned from API");
      }

      // Extract and validate page count
      const pageCount = data.page_count || 10; // Default if not provided
      console.log(`Document has ${pageCount} pages`);

      if (pageCount <= 0) {
        throw new Error("Invalid page count received from API");
      }

      // Create an array of nulls - we'll load pages on demand
      const pages = new Array(pageCount).fill(null);

      // Set up the document structure
      setDocumentPages(pages);
      setTotalPages(pageCount);
      setCurrentPage(0);
      setLoadedDocument(documentId);

      // Clear any previous error messages
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            msg.role !== "assistant" ||
            !msg.content.includes("Error loading document")
        )
      );

      // Now load just the first page
      await loadPage(0);

      return true;
    } catch (error) {
      console.error("Error loading document pages:", error);

      // Reset document state
      setDocumentPages([]);
      setTotalPages(0);

      // Notify the user
      setMessages((prev) => [
        ...prev.filter(
          (msg) =>
            msg.role !== "assistant" ||
            !msg.content.includes("Loading document")
        ),
        {
          role: "assistant",
          content: `Error loading document: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Please try again.`,
        },
      ]);

      return false;
    }
  };

  // Keep loadPage function mostly unchanged, but with direct URL construction
  const loadPage = async (pageNumber: number) => {
    // Validate inputs
    if (!loadedDocument) {
      console.log("No document loaded, skipping page load");
      return;
    }

    // Skip if page is already loaded successfully
    if (documentPages[pageNumber] && documentPages[pageNumber] !== "error") {
      console.log(`Page ${pageNumber} already loaded, skipping`);
      return;
    }

    try {
      // Show loading state first
      setDocumentPages((prevPages) => {
        const updatedPages = [...prevPages];
        // If we previously had an error, clear it to show loading
        if (updatedPages[pageNumber] === "error") {
          updatedPages[pageNumber] = null;
        }
        return updatedPages;
      });

      // Validate and construct the URL
      if (!API_BASE_URL) {
        throw new Error("API base URL is not defined");
      }

      // Format URL properly with trailing slashes
      const baseUrl = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;

      const pageUrl = `${baseUrl}/api/document/${loadedDocument}/page/${pageNumber}`;
      console.log(`Loading page ${pageNumber} from ${pageUrl}`);

      // Update the pages array with the URL
      setDocumentPages((prevPages) => {
        const updatedPages = [...prevPages];
        updatedPages[pageNumber] = pageUrl;
        return updatedPages;
      });
    } catch (error) {
      console.error(`Error loading page ${pageNumber}:`, error);

      // Set error state for this page
      setDocumentPages((prevPages) => {
        const updatedPages = [...prevPages];
        updatedPages[pageNumber] = "error";
        return updatedPages;
      });

      // Provide feedback to the user
      if (pageNumber === currentPage) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Failed to load page ${
              pageNumber + 1
            }. Please check your connection and try again.`,
          },
        ]);
      }
    }
  };

  // Keep current page loading effect unchanged
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
    const pageUrl = documentPages[currentPage] || "";

    // If URL is a data URL, use it directly; otherwise, make a fetch request
    if (pageUrl.startsWith("data:")) {
      link.href = pageUrl;
    } else {
      // For normal URLs, fetch the image and convert to data URL
      fetch(pageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = `document-${loadedDocument}-page-${
            currentPage + 1
          }.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("Error downloading image:", error);
        });
      return;
    }

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

  // Keep fullscreen changes effect unchanged
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Update the document upload handler to simply load the document
  const handleDocumentUpload = (documentId: string) => {
    setSelectedDocumentId(documentId);
    // Load the first page automatically
    loadDocument(documentId, 0);
  };

  // Keep loadDocument function mostly unchanged
  const loadDocument = async (documentId: string, page: number = 0) => {
    try {
      setDocumentLoading(true);
      setDocumentError(null);
      setSelectedDocumentId(documentId);
      console.log(`Loading document ${documentId}, page ${page}`);

      // Initialize document pages array if needed
      if (!documentPages[page]) {
        setDocumentPages((prevPages) => {
          const updatedPages = [...prevPages];
          updatedPages[page] = null;
          return updatedPages;
        });
      }

      // Load the document page
      await loadPage(page);
      setDocumentLoading(false);
    } catch (error: any) {
      console.error("Error loading document:", error);
      setDocumentError(error.message || "Error loading document");
      setDocumentLoading(false);
    }
  };

  // Update handleSelectDocument function to work with the new flow
  const handleSelectDocument = (documentId: string) => {
    if (!documentId) return;
    loadDocument(documentId, 0);
  };

  // Simplify loadHeadingPage to use direct API call
  const loadHeadingPage = async (documentId: string, headingText: string) => {
    try {
      setHeadingLoading(true);
      console.log(
        `Loading page for heading: "${headingText}" in document: ${documentId}`
      );

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        // Call the API to get the page for this heading
        const response = await fetch(
          `${API_BASE_URL}/api/document/${documentId}/heading/${encodeURIComponent(
            headingText
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch page for heading: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Heading page data:", data);

        // Get the page number from the response (0-indexed)
        const pageNumber =
          data.page_number !== undefined ? data.page_number : 0;

        // If the API returns a base64 encoded image directly, use it
        if (data.page_image) {
          // Ensure document is loaded or create a placeholder
          if (loadedDocument !== documentId) {
            // Initialize document pages array if needed
            const pageCount = data.total_pages || 1;

            // Use functional update to avoid stale state
            setDocumentPages(() => {
              const pages = new Array(pageCount).fill(null);
              // Add the base64 image to the pages array
              const imageFormat = data.image_format || "jpeg";
              pages[
                pageNumber
              ] = `data:image/${imageFormat};base64,${data.page_image}`;
              return pages;
            });

            setTotalPages(pageCount);
            setLoadedDocument(documentId);
          } else {
            // Just update the current page with the base64 image
            const imageFormat = data.image_format || "jpeg";

            // Use functional update to avoid stale state
            setDocumentPages((prevPages) => {
              const updatedPages = [...prevPages];
              updatedPages[
                pageNumber
              ] = `data:image/${imageFormat};base64,${data.page_image}`;
              return updatedPages;
            });
          }
        } else {
          // Ensure document is loaded
          if (loadedDocument !== documentId) {
            await loadDocumentPages(documentId);
          }
        }

        // Set current page to the one containing the heading
        setCurrentPage(pageNumber);

        // Highlight the section if coordinates are provided
        if (data.section_rect) {
          setHighlightedSections([
            {
              id: `heading-${Date.now()}`,
              page: pageNumber,
              rect: data.section_rect,
            },
          ]);
        } else {
          // Clear any existing highlights
          setHighlightedSections([]);
        }

        return data;
      } catch (error) {
        // Clear the timeout if an error occurs
        clearTimeout(timeoutId);

        // Re-throw to be handled by the caller
        throw error;
      }
    } catch (error) {
      console.error("Error loading heading page:", error);

      // Show error message to user
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error loading page for heading "${headingText}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ]);

      return null;
    } finally {
      setHeadingLoading(false);
    }
  };

  // Keep the heading click handler
  const handleHeadingClick = (headingText: string, documentId: string) => {
    try {
      // Set the active document and current heading
      setSelectedDocumentId(documentId);
      setCurrentHeading(headingText);

      // Load the relevant page for this heading
      loadHeadingPage(documentId, headingText)
        .then(() => {
          console.log(`Successfully loaded page for heading: ${headingText}`);
        })
        .catch((error) => {
          console.error(
            `Error loading page for heading ${headingText}:`,
            error
          );
        });
    } catch (error) {
      console.error("Error in handleHeadingClick:", error);
    }
  };

  return (
    <main className="chatpage-container" style={{ width: "100%" }}>
      <Sidebar onDocumentUpload={handleDocumentUpload} />
      <div
        className="content-wrapper"
        style={{
          marginLeft: "3.05rem",
          width: "calc(100% - 3.05rem)",
          transition: "margin-left 0.2s ease",
          overflowX: "auto",
        }}
      >
        {/* Small instruction for horizontal scroll */}
        <div className={styles["scroll-instruction"]}>
          <span>Scroll horizontally to see all panels</span>
        </div>

        <div className={styles["papers-container"]}>
          {/* 1. Chatbot Conversation Container */}
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

          {/* 2. Graph Visualization Panel */}
          <div className={styles.panel + " " + styles["graph-panel"]}>
            <div className={styles["panel-header"]}>
              <h2>Document Structure</h2>
              <div className={styles["graph-controls"]}>
                <button
                  className={styles["graph-control-btn"]}
                  onClick={() => graphRef.current?.zoomIn()}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  className={styles["graph-control-btn"]}
                  onClick={() => graphRef.current?.zoomOut()}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  className={styles["graph-control-btn"]}
                  onClick={() => graphRef.current?.fitAll()}
                  title="Fit all"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>
            <div className={styles["graph-container"]}>
              <DocumentStructureGraph
                documentId={selectedDocumentId}
                onNodeClick={handleHeadingClick}
              />
            </div>
          </div>

          {/* 3. Document Viewer Panel */}
          <div
            className={styles.panel + " " + styles["document-viewer-panel"]}
            ref={viewerRef}
          >
            <div className={styles["panel-header"]}>
              <h2>
                Document Viewer
                {currentHeading && (
                  <span className={styles["current-heading-info"]}>
                    {currentHeading}
                  </span>
                )}
              </h2>
              <div className={styles["document-controls"]}>
                <button
                  className={styles["document-control-btn"]}
                  onClick={handlePrevPage}
                  disabled={!loadedDocument || currentPage === 0}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={styles["page-indicator"]}>
                  {loadedDocument ? `${currentPage + 1}/${totalPages}` : "-/-"}
                </span>
                <button
                  className={styles["document-control-btn"]}
                  onClick={handleNextPage}
                  disabled={!loadedDocument || currentPage === totalPages - 1}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <div className={styles["control-divider"]}></div>
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
                {!loadedDocument && !headingLoading && !documentLoading ? (
                  <div className={styles["document-placeholder"]}>
                    <FileText size={48} className={styles.placeholderIcon} />
                    <h3 className={styles.placeholderTitle}>
                      No Document Selected
                    </h3>
                    <p className={styles.placeholderText}>
                      Upload a document from the sidebar to get started.
                    </p>
                    <p className={styles.placeholderSubText}>
                      You can drag and drop a PDF file or use the upload button.
                    </p>
                    <div className={styles.placeholderArrow}>
                      <ArrowLeft size={24} />
                      <span>Upload Here</span>
                    </div>
                  </div>
                ) : documentLoading ? (
                  <div className={styles["document-loading"]}>
                    <div className={styles["loading-spinner"]}></div>
                    <p>Loading document...</p>
                  </div>
                ) : documentError ? (
                  <div className={styles["document-error"]}>
                    <p>Error loading document: {documentError}</p>
                    <button
                      onClick={() => {
                        if (selectedDocumentId) {
                          handleSelectDocument(selectedDocumentId);
                        }
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : currentPage !== null && documentPages[currentPage] ? (
                  <div className={styles["document-image-wrapper"]}>
                    <img
                      key={`page-${currentPage}-${Date.now()}-${documentPages[
                        currentPage
                      ]?.substring(0, 20)}`}
                      className={styles["document-image"]}
                      src={documentPages[currentPage]}
                      alt={`Page ${currentPage + 1}`}
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      }}
                      onError={(e) => {
                        console.error(
                          `Error loading image for page ${currentPage + 1}`
                        );
                        if (e.currentTarget) {
                          setPagesWithErrors((prev) => ({
                            ...prev,
                            [currentPage]: true,
                          }));
                        }
                      }}
                    />
                    {pagesWithErrors[currentPage] && (
                      <div className={styles["document-image-error"]}>
                        <AlertTriangle size={32} />
                        <p>Error loading this page.</p>
                        <button
                          onClick={() => {
                            loadPage(currentPage);
                            setPagesWithErrors((prev) => ({
                              ...prev,
                              [currentPage]: false,
                            }));
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    {highlightedSections
                      .filter((section) => section.page === currentPage)
                      .map((section) => (
                        <div
                          key={section.id}
                          className={styles.highlight}
                          style={{
                            left: `${section.rect.x * 100}%`,
                            top: `${section.rect.y * 100}%`,
                            width: `${section.rect.width * 100}%`,
                            height: `${section.rect.height * 100}%`,
                          }}
                        ></div>
                      ))}
                  </div>
                ) : (
                  <div className={styles["document-placeholder"]}>
                    <p>
                      {headingLoading
                        ? "Loading heading content..."
                        : currentHeading
                        ? `Navigating to "${currentHeading}"...`
                        : loadedDocument
                        ? "Loading document..."
                        : "Select a document to view its content"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Document List Container */}
          <div
            className={styles.panel + " " + styles["document-list-container"]}
          >
            <DocumentList
              onSelectDocument={(documentId) => loadDocument(documentId, 0)}
              selectedDocumentId={selectedDocumentId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
