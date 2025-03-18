"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  FileDigit,
  Layout,
  Search,
  ChevronRight,
  RotateCw,
  Text,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import styles from "./DocumentList.module.css";
import { mockDocuments } from "@/app/api/mockData";

interface DocumentMetadata {
  document_id: string;
  title: string;
  upload_date: string;
  heading_count: number;
  page_count: number;
}

interface DocumentListProps {
  onSelectDocument: (documentId: string) => void;
  selectedDocumentId: string | null;
}

// Define API base URL
const API_BASE_URL = "http://127.0.0.1:5002";

export default function DocumentList({
  onSelectDocument,
  selectedDocumentId,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "pages" | "headings">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch documents from the API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // First try the real backend API
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/document/documents-with-metadata`
          );

          if (response.ok) {
            const data = await response.json();
            setDocuments(data);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log("Backend API not available, falling back to local API");
        }

        // Fall back to local API route with mock data
        const response = await fetch("/api/document/documents-with-metadata");

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setDocuments(data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching documents:", error);
        setError(error.message || "Failed to load documents");
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort documents based on selected criteria
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison =
          new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "pages":
        comparison = a.page_count - b.page_count;
        break;
      case "headings":
        comparison = a.heading_count - b.heading_count;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Handle toggling sort order
  const handleSortChange = (
    newSortBy: "date" | "title" | "pages" | "headings"
  ) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  // Auto-select the first document if none is selected and documents are loaded
  useEffect(() => {
    if (!selectedDocumentId && sortedDocuments.length > 0 && !loading) {
      onSelectDocument(sortedDocuments[0].document_id);
    }
  }, [selectedDocumentId, sortedDocuments, loading, onSelectDocument]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <RotateCw className={styles.loadingIcon} />
        <p>Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.documentListContainer}>
      <div className={styles.documentListHeader}>
        <h2 className={styles.documentListTitle}>Docs</h2>
        <div className={styles.searchContainer}>
          <Search size={10} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.sortOptions}>
        <button
          className={`${styles.sortButton} ${
            sortBy === "date" ? styles.activeSortButton : ""
          }`}
          onClick={() => handleSortChange("date")}
        >
          <Clock size={8} />
          Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          className={`${styles.sortButton} ${
            sortBy === "title" ? styles.activeSortButton : ""
          }`}
          onClick={() => handleSortChange("title")}
        >
          <FileText size={8} />
          Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          className={`${styles.sortButton} ${
            sortBy === "pages" ? styles.activeSortButton : ""
          }`}
          onClick={() => handleSortChange("pages")}
        >
          <FileDigit size={8} />
          Pgs {sortBy === "pages" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          className={`${styles.sortButton} ${
            sortBy === "headings" ? styles.activeSortButton : ""
          }`}
          onClick={() => handleSortChange("headings")}
        >
          <Text size={8} />
          Hds {sortBy === "headings" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>

      {sortedDocuments.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={24} className={styles.emptyIcon} />
          <p>No docs found</p>
          {searchQuery && <p>Try another search</p>}
        </div>
      ) : (
        <ScrollArea className={styles.documentListScrollArea}>
          <div className={styles.documentGrid}>
            {sortedDocuments.map((doc) => (
              <div
                key={doc.document_id}
                className={`${styles.documentCard} ${
                  doc.document_id === selectedDocumentId
                    ? styles.selectedDocumentCard
                    : ""
                }`}
                onClick={() => onSelectDocument(doc.document_id)}
              >
                <div className={styles.documentIconContainer}>
                  <FileText size={14} className={styles.documentIcon} />
                </div>
                <div className={styles.documentInfo}>
                  <h3 className={styles.documentTitle}>{doc.title}</h3>
                  <p className={styles.documentDate}>
                    <Clock size={8} />
                    {formatDistanceToNow(new Date(doc.upload_date), {
                      addSuffix: true,
                    })}
                  </p>
                  <div className={styles.documentMetadata}>
                    <span className={styles.metadataItem}>
                      <FileDigit size={8} />
                      {doc.page_count} {doc.page_count === 1 ? "p" : "p"}
                    </span>
                    <span className={styles.metadataItem}>
                      <Text size={8} />
                      {doc.heading_count} {doc.heading_count === 1 ? "h" : "h"}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={10}
                  className={`${styles.documentCardArrow} ${
                    doc.document_id === selectedDocumentId
                      ? styles.visibleArrow
                      : ""
                  }`}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
