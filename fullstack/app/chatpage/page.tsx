"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./page.module.css";
import { PaperclipIcon, SendIcon, FileText } from "lucide-react";
import { Sidebar } from "@/app/components/ui/sidebar";
import DocumentStructureGraph from "./components/DocumentStructureGraph";
import DocumentList from "../components/DocumentList";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// Dynamically import PDF viewer components with SSR disabled
const PDFViewer = dynamic(() => import("./components/PDFViewer"), {
  ssr: false,
});

// API base URL constant
const API_BASE_URL = "http://127.0.0.1:5002";

// Define interfaces for backend data
interface DocumentMetadata {
  id: string;
  name: string;
  upload_date: string;
  page_count: number;
  status: string;
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

// Add interfaces for node context information
interface VisualReference {
  image_reference: string;
  image_caption: string;
  page_reference: number;
}

interface NodeContext {
  headingText: string;
  context: string;
  pageReference: number;
  visualReferences: VisualReference[];
}

// Modify PDFDocumentViewer to use the dynamic import
const PDFDocumentViewer = ({
  documentId,
  documentName,
}: {
  documentId: string | null;
  documentName?: string;
}) => {
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>(documentName || "Document");

  // Update filename when documentName prop changes
  useEffect(() => {
    if (documentName) {
      console.log(`Document name received from props: ${documentName}`);
      setFilename(documentName);
    }
  }, [documentName]);

  const fetchPdf = async (docId: string, retryCount = 0) => {
    setIsLoading(true);
    setError(null);

    // Only clear base64Pdf on the first attempt, not on retries
    if (retryCount === 0) {
      setBase64Pdf(null);
    }

    try {
      console.log(
        `Fetching PDF for document ID: ${docId} (Attempt ${retryCount + 1})`
      );

      // Fetch the PDF document from the backend as base64
      const response = await fetch(
        `${API_BASE_URL}/api/document/document/${docId}/original-pdf`
      );

      console.log("API response status:", response.status);

      if (!response.ok) {
        // For 5xx errors, consider retrying
        if (response.status >= 500 && retryCount < 3) {
          console.log(`Server error (${response.status}), retrying...`);
          setIsLoading(false);

          // Wait a bit longer between retries
          setTimeout(() => {
            fetchPdf(docId, retryCount + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff

          return;
        }

        throw new Error(
          `Failed to fetch PDF: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API response data keys:", Object.keys(data));

      // Try to find base64 PDF data in various possible response formats
      let pdfBase64 = null;
      let documentFilename = documentName || filename;

      // Extract PDF data from original_pdf property
      if (data.original_pdf && typeof data.original_pdf === "string") {
        pdfBase64 = data.original_pdf;
        console.log("Found base64 PDF data in original_pdf property");
      } else {
        console.error("Response data structure:", data);
        throw new Error("No original_pdf property found in server response");
      }

      // Use the document name from props if available, otherwise try to extract from the response
      if (!documentName) {
        if (data.filename) {
          documentFilename = data.filename;
        } else if (data.name) {
          documentFilename = data.name;
        } else if (data.title) {
          documentFilename = data.title;
        } else if (data.document_name) {
          documentFilename = data.document_name;
        } else if (data.document_id) {
          documentFilename = `Document-${data.document_id}`;
        }
      }

      if (!pdfBase64) {
        console.error("Response data structure:", data);
        throw new Error("No PDF data found in server response");
      }

      // Remove potential data URI prefix if present
      if (pdfBase64.startsWith("data:application/pdf;base64,")) {
        pdfBase64 = pdfBase64.substring("data:application/pdf;base64,".length);
      }

      // Set the base64 PDF data and filename
      console.log("Setting base64 PDF data, length:", pdfBase64.length);
      setBase64Pdf(pdfBase64);
      console.log("Setting filename:", documentFilename);
      setFilename(documentFilename);
    } catch (err: any) {
      console.error("Error fetching PDF:", err);

      // Retry for network errors
      if (err.message.includes("NetworkError") && retryCount < 3) {
        console.log(`Network error, retrying (${retryCount + 1}/3)...`);
        setIsLoading(false);

        // Wait a bit longer between retries
        setTimeout(() => {
          fetchPdf(docId, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff

        return;
      }

      setError(err.message || "Failed to load PDF document");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the PDF when the document ID changes
  useEffect(() => {
    if (documentId) {
      fetchPdf(documentId);
    } else {
      // Reset the state when no document is selected
      setBase64Pdf(null);
      setError(null);
      setIsLoading(false);
      setFilename("Document");
    }
  }, [documentId]);

  return (
    <div className={styles["pdf-container"]}>
      <PDFViewer
        base64Pdf={base64Pdf || undefined}
        filename={filename}
        isLoading={isLoading}
        error={error}
        onRetry={documentId ? () => fetchPdf(documentId) : undefined}
      />
    </div>
  );
};

export default function DocumentAnalysisPage() {
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

  // State for document selection
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const viewerRef = useRef<HTMLDivElement>(null);

  // State for document management
  const [activeDocuments, setActiveDocuments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // State to track document names by their IDs
  const [documentNames, setDocumentNames] = useState<Record<string, string>>(
    {}
  );

  // State for current heading
  const [currentHeading, setCurrentHeading] = useState<string | null>(null);

  // Add state for node context information
  const [nodeContext, setNodeContext] = useState<NodeContext | null>(null);

  // Add state for active tab
  const [activeTab, setActiveTab] = useState<"context" | "page-view">(
    "context"
  );

  // DocumentStructure state to store the document structure data
  const [documentStructure, setDocumentStructure] = useState<any>(null);

  // State for query mode
  const [queryMode, setQueryMode] = useState<"text" | "graph">("text");

  // Add this to fix hydration issues
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = mounted && theme === "dark";
  
  // This ensures we only access theme on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to fetch document structure data
  const fetchDocumentStructure = async (docId: string) => {
    try {
      // Fetch the document structure
      const response = await fetch(
        `${API_BASE_URL}/api/structure/document/${docId}/structured`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch document structure: ${response.status}`
        );
      }

      const data = await response.json();
      setDocumentStructure(data);
      return data;
    } catch (error) {
      console.error("Error fetching document structure:", error);
      return null;
    }
  };

  // Function to extract node context from document structure
  const extractNodeContext = useCallback(
    async (headingText: string, documentId: string): Promise<void> => {
      console.log(
        `Extracting context for "${headingText}" in document ${documentId}`
      );

      // Clear previous context
      setNodeContext(null);

      try {
        // If we don't have the document structure yet, fetch it
        let structure = documentStructure;
        if (!structure) {
          structure = await fetchDocumentStructure(documentId);
          if (!structure) {
            throw new Error("Failed to fetch document structure");
          }
        }

        // Search for the heading in the document structure
        let foundContext: NodeContext | null = null;

        // Search in main headings
        if (structure.document_structure) {
          for (const heading of structure.document_structure) {
            // Check if this is the main heading we're looking for
            if (heading.heading === headingText) {
              foundContext = {
                headingText,
                context: heading.context || "No context available", // Some headings might not have context
                pageReference: heading.page_reference || 0,
                visualReferences: [],
              };
              break;
            }

            // Check subheadings if available
            if (heading.subheadings && heading.subheadings.length > 0) {
              for (const subheading of heading.subheadings) {
                if (subheading.title === headingText) {
                  foundContext = {
                    headingText,
                    context: subheading.context || "No context available",
                    pageReference: subheading.page_reference || 0,
                    visualReferences: subheading.visual_references || [],
                  };
                  break;
                }

                // Check sub-subheadings if available
                if (
                  subheading.subheadings &&
                  subheading.subheadings.length > 0
                ) {
                  for (const subSubheading of subheading.subheadings) {
                    if (subSubheading.title === headingText) {
                      foundContext = {
                        headingText,
                        context:
                          subSubheading.context || "No context available",
                        pageReference: subSubheading.page_reference || 0,
                        visualReferences: subSubheading.visual_references || [],
                      };
                      break;
                    }
                  }
                  if (foundContext) break;
                }
              }
              if (foundContext) break;
            }
          }
        }

        if (foundContext) {
          console.log("Found context:", foundContext);
          setNodeContext(foundContext);
        } else {
          console.log(`No context found for heading "${headingText}"`);
          setNodeContext({
            headingText,
            context: "No context available for this heading",
            pageReference: 0,
            visualReferences: [],
          });
        }
      } catch (error) {
        console.error("Error extracting node context:", error);
        setNodeContext({
          headingText,
          context: "Error extracting context information",
          pageReference: 0,
          visualReferences: [],
        });
      }
    },
    [documentStructure]
  );

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

        // Store the document name
        setDocumentNames((prev) => ({
          ...prev,
          [data.document_id]: file.name,
        }));

        // Set the uploaded document as selected
        setSelectedDocumentId(data.document_id);
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

      // If there are citations, set the first document as selected
      if (data.citations && data.citations.length > 0) {
        const firstCitation = data.citations[0];
        if (firstCitation && firstCitation.doc_id) {
          setSelectedDocumentId(firstCitation.doc_id);
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

  // Handle document selection
  const handleSelectDocument = (documentId: string, documentName?: string) => {
    if (!documentId) return;

    console.log(
      `Selected document: ${documentId}${
        documentName ? ` (${documentName})` : ""
      }`
    );
    setSelectedDocumentId(documentId);

    // If documentName is provided, store it
    if (documentName) {
      setDocumentNames((prev) => ({
        ...prev,
        [documentId]: documentName,
      }));
    }

    // Reset current heading and node context when selecting a new document
    setCurrentHeading(null);
    setNodeContext(null);

    // Add to active documents if not already present
    if (!activeDocuments.includes(documentId)) {
      setActiveDocuments((prev) => [...prev, documentId]);
    }
  };

  // Document upload handler
  const handleDocumentUpload = (documentId: string, documentName?: string) => {
    setSelectedDocumentId(documentId);

    // If documentName is provided, store it
    if (documentName) {
      setDocumentNames((prev) => ({
        ...prev,
        [documentId]: documentName,
      }));
    }

    // Reset current heading and node context when uploading a new document
    setCurrentHeading(null);
    setNodeContext(null);

    // Add to active documents if not already present
    if (!activeDocuments.includes(documentId)) {
      setActiveDocuments((prev) => [...prev, documentId]);
    }
  };

  // Update heading click handler to only load context without switching tab
  const handleHeadingClick = useCallback(
    (headingText: string, documentId: string, pageReference?: number) => {
      console.log(
        `Clicked on heading "${headingText}" in document ${documentId}${
          pageReference ? `, page ${pageReference}` : ""
        }`
      );

      // Update document and heading state
      setCurrentHeading(headingText);
      setSelectedDocumentId(documentId);

      // Extract context only - no tab switching
      extractNodeContext(headingText, documentId);
    },
    [extractNodeContext]
  );

  // Handle tab change (unchanged)
  const handleTabChange = (tab: "context" | "page-view") => {
    // Prevent unnecessary re-renders when tab is already active
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  // Use this conditional rendering to prevent hydration errors
  if (!mounted) {
    return <div className="loading-container">Loading...</div>; // Simple loading state
  }

  return (
    <main className={`chatpage-container ${isDarkTheme ? "dark-mode bg-gray-900" : ""}`}>
      <Sidebar onDocumentUpload={handleDocumentUpload} />
      <div
        className={`content-wrapper ${
          isDarkTheme ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
        style={{
          marginLeft: "3.05rem",
          width: "calc(100% - 3.05rem)",
          transition: "margin-left 0.2s ease",
          overflowX: "auto",
        }}
      >
        {/* Small instruction for horizontal scroll */}
        <div className={`${styles["scroll-instruction"]} ${
          isDarkTheme ? "text-gray-400 bg-gray-900" : ""
        }`}>
          <span>Scroll horizontally to see all panels</span>
        </div>

        <div className={styles["papers-container"]}>
          {/* 1. Chatbot Conversation Container */}
          <div className={`${styles.panel} ${styles["chatbot-panel"]} ${
            isDarkTheme ? "bg-gray-900 border-gray-700" : ""
          }`}>
            <div className={`${styles["panel-header"]} ${
              isDarkTheme ? "bg-gray-800 border-gray-700" : ""
            }`}>
              <h2>AI Document Assistant</h2>
            </div>
            <div className={styles["chat-container"]}>
              <div className={styles["messages-list"]}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${styles["message"]} ${styles[message.role]} ${
                      isDarkTheme ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
                    }`}
                  >
                    <div className={styles["message-content"]}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div
                    className={`${styles["message"]} ${styles["assistant"]} ${
                      isDarkTheme ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
                    }`}
                  >
                    <div className={styles["message-content"]}>
                      <div className={`${styles["typing-indicator"]} ${
                        isDarkTheme ? "bg-gray-700" : ""
                      }`}>
                        <span className={isDarkTheme ? "bg-gray-400" : ""}></span>
                        <span className={isDarkTheme ? "bg-gray-400" : ""}></span>
                        <span className={isDarkTheme ? "bg-gray-400" : ""}></span>
                      </div>
                    </div>
                  </div>
                )}
                {isUploading && (
                  <div
                    className={`${styles["message"]} ${styles["assistant"]} ${
                      isDarkTheme ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
                    }`}
                  >
                    <div className={styles["message-content"]}>
                      <div className={`${styles["upload-progress"]} ${
                        isDarkTheme ? "bg-gray-700" : ""
                      }`}>
                        <div
                          className={`${styles["upload-progress-bar"]} ${
                            isDarkTheme ? "bg-blue-600" : ""
                          }`}
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
              <div className={styles["query-mode-buttons"]}>
                <button
                  type="button"
                  onClick={() => setQueryMode("text")}
                  className={`${styles["mode-button"]} ${
                    queryMode === "text" ? styles["mode-button-active"] : ""
                  } ${
                    isDarkTheme ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-200"
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setQueryMode("graph")}
                  className={`${styles["mode-button"]} ${
                    queryMode === "graph" ? styles["mode-button-active"] : ""
                  } ${
                    isDarkTheme ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-200"
                  }`}
                >
                  Graph
                </button>
              </div>
              <div className={styles["chat-input-container"]}>
                <form
                  onSubmit={handleSendMessage}
                  className={`${styles["chat-form"]} ${
                    isDarkTheme ? "bg-gray-800 border-gray-700" : ""
                  }`}
                >
                  <div className={styles["chat-input-wrapper"]} style={{ position: "relative", width: "100%" }}>
                    <input
                      type="text"
                      className={`${styles["chat-input"]} ${
                        isDarkTheme ? "bg-gray-700 text-gray-100 border-gray-600" : ""
                      }`}
                      placeholder="Ask about your documents..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isUploading || isTyping}
                      style={{ paddingRight: "60px" }}
                    />
                    <button
                      type="button"
                      className={styles["attachment-button"]}
                      onClick={() => {
                        document.getElementById("file-upload")?.click();
                      }}
                      disabled={isUploading || isTyping}
                    >
                      <PaperclipIcon className={`h-5 w-5 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`${styles["send-button"]} ${
                      isDarkTheme ? "bg-blue-600 hover:bg-blue-700" : ""
                    }`}
                    disabled={!userInput.trim() || isUploading || isTyping}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}
                  >
                    <SendIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 2. Graph Visualization Panel */}
          <div
            className={`${styles.panel} ${styles["document-structure-panel"]} ${
              isDarkTheme ? "bg-gray-900 border-gray-700" : ""
            }`}
          >
            <div className={styles["panel-header"]}>
              <h2>Document Structure</h2>
            </div>
            <div
              className={`${styles["graph-container"]} ${
                isDarkTheme ? "bg-gray-800" : ""
              }`}
              style={{ minHeight: "600px" }}
            >
              <DocumentStructureGraph
                documentId={selectedDocumentId}
                onNodeClick={handleHeadingClick}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>

          {/* 3. Document Viewer Panel - updated with tabs */}
          <div
            className={`${styles.panel} ${styles["document-viewer-panel"]} ${
              isDarkTheme ? "bg-gray-900 border-gray-700" : ""
            }`}
            ref={viewerRef}
          >
            <div className={styles["panel-header"]}>
              <h2>Document Navigator</h2>
            </div>

            {/* Tab Navigation */}
            <ul className={`${styles["tab-navigation"]} ${
              isDarkTheme ? "bg-gray-800 border-gray-700" : ""
            }`}>
              <li
                className={`${styles["tab-item"]} ${
                  activeTab === "context" ? styles.active : ""
                } ${
                  isDarkTheme ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
                }`}
                onClick={() => handleTabChange("context")}
              >
                Context
              </li>
              <li
                className={`${styles["tab-item"]} ${
                  activeTab === "page-view" ? styles.active : ""
                } ${
                  isDarkTheme ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
                }`}
                onClick={() => handleTabChange("page-view")}
              >
                Page View
              </li>
            </ul>

            <div className={styles["document-viewer-container"]}>
              {/* Context Tab Content */}
              <div
                className={`${styles["tab-content"]} ${
                  activeTab === "context" ? styles.active : ""
                } ${
                  isDarkTheme ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
                }`}
              >
                {nodeContext ? (
                  <div className={styles["document-context"]}>
                    <h3 className={styles["context-heading"]}>
                      {nodeContext.headingText}
                    </h3>

                    {nodeContext.pageReference > 0 && (
                      <div className={styles["context-page-reference"]}>
                        Page: {nodeContext.pageReference}
                      </div>
                    )}

                    <div className={styles["context-content"]}>
                      <h4>Content:</h4>
                      <p>{nodeContext.context}</p>
                    </div>

                    {nodeContext.visualReferences &&
                      nodeContext.visualReferences.length > 0 && (
                        <div className={styles["context-visual-references"]}>
                          <h4>Visual References:</h4>
                          <ul>
                            {nodeContext.visualReferences.map((ref, index) => (
                              <li
                                key={index}
                                className={styles["visual-reference-item"]}
                              >
                                {ref.image_caption && (
                                  <div className={styles["image-caption"]}>
                                    <strong>Caption:</strong>{" "}
                                    {ref.image_caption}
                                  </div>
                                )}
                                {ref.page_reference && (
                                  <div className={styles["image-page"]}>
                                    <strong>Page:</strong> {ref.page_reference}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className={`${styles["document-placeholder"]} ${
                    isDarkTheme ? "bg-gray-800" : ""
                  }`}>
                    <FileText size={48} className={`${styles.placeholderIcon} ${
                      isDarkTheme ? "text-gray-400" : ""
                    }`} />
                    <h3 className={`${styles.placeholderTitle} ${
                      isDarkTheme ? "text-gray-200" : ""
                    }`}>
                      Document Context Panel
                    </h3>
                    <p className={`${styles.placeholderText} ${
                      isDarkTheme ? "text-gray-400" : ""
                    }`}>
                      {currentHeading
                        ? `Selected heading: "${currentHeading}"`
                        : selectedDocumentId
                        ? "Document selected. Click on a heading in the structure to navigate."
                        : "Select a document to see context information."}
                    </p>
                  </div>
                )}
              </div>

              {/* Page View Tab Content */}
              <div
                className={`${styles["tab-content"]} ${
                  activeTab === "page-view" ? styles.active : ""
                } ${
                  isDarkTheme ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
                }`}
              >
                <PDFDocumentViewer
                  documentId={selectedDocumentId}
                  documentName={
                    selectedDocumentId
                      ? documentNames[selectedDocumentId]
                      : undefined
                  }
                />
              </div>
            </div>
          </div>

          {/* 4. Document List Container */}
          <div
            className={`${styles.panel} ${styles["document-list-container"]} ${
              isDarkTheme ? "bg-gray-900 border-gray-700" : ""
            }`}
          >
            <DocumentList
              onSelectDocument={handleSelectDocument}
              selectedDocumentId={selectedDocumentId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
