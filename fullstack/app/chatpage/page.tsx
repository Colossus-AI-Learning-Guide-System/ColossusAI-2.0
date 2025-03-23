"use client";

import { useState, useRef, useEffect } from "react";
import ReactFlow, { Node, Edge, Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import styles from "./page.module.css";
import "./style.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import { useRouter } from "next/navigation";
import { getCurrentSession } from "@/lib/supabase/auth";

type NodeContent = {
  title: string;
  content: string;
};

interface ResponseData {
  title: string;
  content: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentContent, setCurrentContent] = useState<NodeContent | null>(
    null
  );
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeContents, setNodeContents] = useState<{
    [key: string]: NodeContent;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session, error } = await getCurrentSession();
        if (error || !session) {
          // No valid session, redirect to signin
          router.push("/signin");
          return;
        }
        // User is authenticated
        setIsAuthChecking(false);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  // Function to handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    const fileData: string[] = [];
    const fileNames: string[] = [];

    // Read all selected files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if the file is a PDF
      if (!file.type.includes("pdf")) {
        setErrorMessage("Only PDF files are supported");
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        setIsLoading(false);
        return;
      }

      fileNames.push(file.name);

      // Convert file to base64
      const reader = new FileReader();
      const base64String = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      fileData.push(base64String);
    }

    try {
      // Send files to backend
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "File upload failed");
      }

      setUploadedFiles((prev) => [...prev, ...fileNames]);
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload files";
      console.error("Error uploading files:", error);
      setErrorMessage(errorMessage);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) {
      setErrorMessage("Please enter a query");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    if (uploadedFiles.length === 0) {
      setErrorMessage("Please upload at least one document first");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsLoading(true);
    setShowError(false);

    try {
      // Send query to backend
      const response = await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Query failed");
      }

      const data = await response.json();

      // Process the response to create nodes and edges
      generateGraphFromResponse(data);

      setShowRoadmap(true);
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process query";
      console.error("Error querying:", error);
      setErrorMessage(errorMessage);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate graph from API response
  const generateGraphFromResponse = (responseData: ResponseData[]) => {
    // Create a new nodecontent object
    const newNodeContents: { [key: string]: NodeContent } = {};

    // Generate nodes from the response
    const newNodes: Node[] = responseData.map((item, index) => {
      const id = (index + 1).toString();

      // Extract title from the item
      let displayTitle = item.title
        .replace(/^\d+\.\s+/, "") // Remove numbering prefix like "1. "
        .trim();

      // Limit title length for display
      if (displayTitle.length > 30) {
        displayTitle = displayTitle.substring(0, 27) + "...";
      }

      // Store the content for this node
      newNodeContents[id] = {
        title: item.title,
        content: item.content,
      };

      // Calculate positions (central node at top, others arranged in a circle)
      let x = 400;
      let y = 100;

      if (index > 0) {
        const radius = 300;
        const angle = ((index - 1) / (responseData.length - 1)) * Math.PI * 2;
        x = 400 + radius * Math.cos(angle);
        y = 250 + radius * Math.sin(angle);
      }

      return {
        id,
        position: { x, y },
        data: { label: displayTitle },
        style: {
          background: index === 0 ? "#ffeb3b" : "#fff3c4",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid black",
          width: 200,
          color: "#000",
        },
      };
    });

    // Generate edges connecting the central node (first node) to all others
    const newEdges: Edge[] = [];

    for (let i = 1; i < newNodes.length; i++) {
      newEdges.push({
        id: `e1-${i + 1}`,
        source: "1",
        target: (i + 1).toString(),
        type: "smoothstep",
        animated: true,
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setNodeContents(newNodeContents);
  };

  const toggleRoadmap = () => {
    setShowRoadmap(!showRoadmap);
  };

  const toggleContent = () => {
    setShowContent(!showContent);
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    const content = nodeContents[node.id];
    if (content) {
      setCurrentContent(content);
      setShowContent(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSidebarToggle = (isExpanded: boolean) => {
    setIsSidebarExpanded(isExpanded);
  };

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="noise-overlay" />
      <main className={`${styles.dashboard} ${isSidebarExpanded ? styles.expanded : ''}`}>
        <Sidebar
          onToggleRoadmap={toggleRoadmap}
          isRoadmapVisible={showRoadmap}
          onToggleContent={toggleContent}
          isContentVisible={showContent}
          onSidebarToggle={handleSidebarToggle}
        />
        <div className={styles.mainContent}>
          {showRoadmap && (
            <div className={styles.roadmapSection}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                  onNodeClick={onNodeClick}
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    flex: 1,
                    minHeight: "400px",
                  }}
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </div>
            </div>
          )}
          {showContent && (
            <div className={styles.contentSection}>
              <Content content={currentContent} />
            </div>
          )}
          <div className={styles.chatSection}>
            <div className={styles.chatArea}>
              <div className={styles.welcomeContainer}>
                <div className={styles.welcomeMessage}>How can I help you?</div>
                <div className={styles.subheading}>Colossus.Ai assistant</div>
              </div>

              {/* File upload area */}
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf"
                  style={{ display: "none" }}
                />
                <button
                  onClick={triggerFileInput}
                  className={styles.uploadButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Upload PDFs"}
                </button>
                {uploadedFiles.length > 0 && (
                  <div className={styles.fileList}>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className={styles.fileName}>
                        {file}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showError && (
                <div className={styles.errorMessage}>{errorMessage}</div>
              )}

              {isLoading && !showError && (
                <div className={styles.loadingIndicator}>
                  Processing your request...
                </div>
              )}

              <div className={styles.chatInput}>
                <input
                  type="text"
                  placeholder="Ask anything about your documents..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  className={styles.arrowButton}
                  style={{ borderRadius: "50%", padding: "10px", border: "none" }}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
