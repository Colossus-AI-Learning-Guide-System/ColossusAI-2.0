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

// Example user data - in a real app, this would come from your auth system
const mockUserData = {
  permissions: ["general", "upgrade"], // User only has access to general and upgrade sections
  subscription: "free", // User is on free tier
  featureFlags: {
    securitySettings: true,
    memoryManagement: true, // Memory feature is not yet available
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

export function Sidebar() {
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
      setDocuments(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeDocument = useCallback((index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-30 h-full shrink-0 border-r"
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-30 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all shadow-sm`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2" 
                    >
                      <Avatar className='rounded size-4'>
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">
                              User
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <div className="flex flex-row items-center gap-2 p-2">
                      <Avatar className="size-6">
                        <AvatarFallback>
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          User
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          user@example.com
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                    >
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
                          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
                          "min-h-[120px] cursor-pointer"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-center text-gray-500">
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
                          <h3 className="text-sm font-medium mb-2">Attached Documents</h3>
                          <div className="flex flex-col gap-2">
                            {documents.map((file, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                  <span className="text-xs truncate">{file.name}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeDocument(index);
                                  }}
                                  className="text-gray-400 hover:text-red-500"
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
                    className="flex w-full items-center justify-start gap-2 px-2"
                    onClick={() => {
                      setDefaultSettingsTab("security");
                      setIsSettingsOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">Settings</span>}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center justify-start gap-2 px-2"
                    onClick={() => {
                      setDefaultSettingsTab("general");
                      setIsSettingsOpen(true);
                    }}
                  >
                    <UserCircle className="h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">Profile</span>}
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