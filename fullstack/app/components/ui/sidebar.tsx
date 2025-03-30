"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  FileText,
  LogOut,
  Settings,
  Upload,
  UserCircle,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Separator } from "@/app/components/ui/separator";
import { SettingsPanel } from "@/app/components/settings-panel";

// TODO: Replace with real user data from authentication system in production
// This temporary placeholder is used for demonstration purposes only
const mockUserData = {
  permissions: ["general", "upgrade"], // User only has access to general and upgrade sections
  subscription: "free", // User is on free tier
  featureFlags: {
    securitySettings: true,
    memoryManagement: true,
  },
};

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

// Add to your props interface
interface SidebarProps {
  onDocumentUpload?: (documentId: string, documentName: string) => void;
}

export function Sidebar({ onDocumentUpload }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultSettingsTab, setDefaultSettingsTab] = useState("general");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setDocuments((prev) => [...prev, ...newFiles]);

      // Upload each file to the backend
      newFiles.forEach((file) => {
        uploadFileToBackend(file);
      });
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        setDocuments((prev) => [...prev, ...newFiles]);

        // Upload each file to the backend
        newFiles.forEach((file) => {
          uploadFileToBackend(file);
        });
      }
    },
    []
  );

  const removeDocument = useCallback((index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Add this new function to handle the upload
  const uploadFileToBackend = async (file: File) => {
    try {
      console.log(`Starting upload of "${file.name}" to backend...`);
      console.log(`File type: ${file.type}, size: ${file.size} bytes`);

      // Validate file is PDF
      if (file.type !== "application/pdf") {
        alert("Only PDF files are supported");
        return;
      }

      // Check file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        alert("File size exceeds 25MB limit");
        return;
      }

      // Read the file as base64
      const reader = new FileReader();

      // Create a promise to handle the FileReader async operation
      const readFileAsBase64 = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix (data:application/pdf;base64,)
          const base64Content = base64String.split(",")[1];
          resolve(base64Content);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
        reader.readAsDataURL(file);
      });

      // Wait for the file to be read
      const base64Content = await readFileAsBase64;

      // Prepare JSON payload according to new API specifications
      const payload = {
        file: base64Content,
        filename: file.name,
      };

      console.log("Sending document to unified upload API...");

      // Send to the new unified upload API
      const response = await fetch(
        "http://127.0.0.1:5002/api/document/unified-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        // Try to get more detailed error information
        const errorText = await response.text();
        console.error("Error response body:", errorText);

        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          // Try to parse as JSON if possible
          const errorJson = JSON.parse(errorText);
          if (errorJson.message || errorJson.error) {
            errorMessage = errorJson.message || errorJson.error;
          }
        } catch (e) {
          // If not JSON, use the raw text if available
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`Document "${file.name}" uploaded successfully:`, data);

      // Store document_id for future reference
      const documentId = data.document_id;

      // Set as selected document (you'll need to pass this function as a prop)
      if (documentId && onDocumentUpload) {
        onDocumentUpload(documentId, file.name);
      }

      alert(
        `Document "${file.name}" uploaded successfully! RAG indexing in progress.`
      );

      // Return the document data for potential use by the caller
      return data;
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Failed to upload document: ${error.message || "Unknown error"}`);
    }
  };

  // Add a function to poll for indexing status
  const pollIndexingStatus = async (documentId: string) => {
    try {
      console.log(
        `Starting to poll indexing status for document ${documentId}`
      );

      // Initial delay before first poll
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Poll up to 30 times with 5-second intervals (total 2.5 minutes)
      for (let i = 0; i < 30; i++) {
        const response = await fetch(
          `http://127.0.0.1:5002/api/document/indexing-status/${documentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to get indexing status: ${response.status}`);
          break;
        }

        const statusData = await response.json();
        console.log(`Indexing status for ${documentId}:`, statusData);

        if (statusData.rag_status === "completed") {
          console.log(`RAG indexing completed for document ${documentId}`);
          // You could update UI or notify the user here
          alert(`Document fully indexed and ready for querying!`);
          break;
        } else if (statusData.rag_status === "failed") {
          console.error(`RAG indexing failed for document ${documentId}`);
          alert(
            `Warning: Document visualization is available, but RAG indexing failed.`
          );
          break;
        }

        // Wait 5 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error("Error polling indexing status:", error);
    }
  };

  return (
    <motion.div
      className={cn("sidebar fixed left-0 z-30 h-full shrink-0 border-r")}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-30 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-gray-950 dark:border-gray-800 transition-all shadow-sm`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b dark:border-gray-800 p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2"
                    >
                      <Avatar className="rounded size-4">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">User</p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <div className="flex flex-row items-center gap-2 p-2">
                      <Avatar className="size-6">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">User</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          user@example.com
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 hover:text-white dark:hover:text-white">
                      <LogOut className="h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  {!isCollapsed && (
                    <div className="flex flex-col gap-4">
                      {/* Drag and Drop Area */}
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-all duration-200",
                          isDragging
                            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600",
                          "min-h-[120px] cursor-pointer"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                          Drag & drop files here or click to browse
                        </p>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* Document List */}
                      {documents.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">
                            Attached Documents
                          </h3>
                          <div className="flex flex-col gap-2">
                            {documents.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
                                  <span className="text-xs truncate dark:text-gray-300">
                                    {file.name}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeDocument(index);
                                  }}
                                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Bottom buttons for Settings and Profile */}
              <div className="mt-auto p-2 border-t">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center justify-start gap-2 px-2 hover:text-white dark:hover:text-white"
                    onClick={() => {
                      setDefaultSettingsTab("security");
                      setIsSettingsOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">Settings</span>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userPermissions={mockUserData.permissions}
        userSubscription={mockUserData.subscription}
        featureFlags={mockUserData.featureFlags}
        defaultPanel={defaultSettingsTab}
      />
    </motion.div>
  );
}
