"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { PaperclipIcon, SendIcon, FileText } from "lucide-react";
import { Sidebar } from "@/app/components/ui/sidebar";
import DocumentStructureGraph from "./components/DocumentStructureGraph";
import DocumentList from "../components/DocumentList";

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

  // State for current heading
  const [currentHeading, setCurrentHeading] = useState<string | null>(null);

  // Add state for node context information
  const [nodeContext, setNodeContext] = useState<NodeContext | null>(null);

  // DocumentStructure state to store the document structure data
  const [documentStructure, setDocumentStructure] = useState<any>(null);

  // Function to fetch document structure data
  const fetchDocumentStructure = async (docId: string) => {
    try {
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
  const handleSelectDocument = (documentId: string) => {
    if (!documentId) return;

    console.log(`Selected document: ${documentId}`);
    setSelectedDocumentId(documentId);

    // Reset current heading and node context when selecting a new document
    setCurrentHeading(null);
    setNodeContext(null);

    // Add to active documents if not already present
    if (!activeDocuments.includes(documentId)) {
      setActiveDocuments((prev) => [...prev, documentId]);
    }
  };

  // Document upload handler
  const handleDocumentUpload = (documentId: string) => {
    setSelectedDocumentId(documentId);

    // Reset current heading and node context when uploading a new document
    setCurrentHeading(null);
    setNodeContext(null);

    // Add to active documents if not already present
    if (!activeDocuments.includes(documentId)) {
      setActiveDocuments((prev) => [...prev, documentId]);
    }
  };

  // Update heading click handler to extract context
  const handleHeadingClick = useCallback(
    (headingText: string, documentId: string, pageReference?: number) => {
      console.log(
        `Clicked on heading "${headingText}" in document ${documentId}${
          pageReference ? `, page ${pageReference}` : ""
        }`
      );
      setCurrentHeading(headingText);
      setSelectedDocumentId(documentId);

      // Extract context for the clicked heading
      extractNodeContext(headingText, documentId);
    },
    [extractNodeContext]
  );

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
          <div
            className={styles.panel + " " + styles["document-structure-panel"]}
          >
            <div className={styles["panel-header"]}>
              <h2>Document Structure</h2>
            </div>
            <div
              className={styles["graph-container"]}
              style={{ minHeight: "600px" }}
            >
              <DocumentStructureGraph
                documentId={selectedDocumentId}
                onNodeClick={handleHeadingClick}
              />
            </div>
          </div>

          {/* 3. Document Viewer Panel - updated to show node context */}
          <div
            className={styles.panel + " " + styles["document-viewer-panel"]}
            ref={viewerRef}
          >
            <div className={styles["panel-header"]}>
              <h2>Context</h2>
            </div>

            <div className={styles["document-viewer-container"]}>
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
                                  <strong>Caption:</strong> {ref.image_caption}
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
                <div className={styles["document-placeholder"]}>
                  <FileText size={48} className={styles.placeholderIcon} />
                  <h3 className={styles.placeholderTitle}>
                    Document Context Panel
                  </h3>
                  <p className={styles.placeholderText}>
                    {currentHeading
                      ? `Selected heading: "${currentHeading}"`
                      : selectedDocumentId
                      ? "Document selected. Click on a heading in the structure to navigate."
                      : "Select a document to see context information."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Document List Container */}
          <div
            className={styles.panel + " " + styles["document-list-container"]}
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
