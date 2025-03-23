import { Node, Edge } from "reactflow";

// Backend API response types
export interface DocumentStructureResponse {
  document_structure: DocumentStructure[];
  document_name?: string;
  enhanced?: boolean;
  title?: string;
}

export interface DocumentStructure {
  heading: string;
  page_reference: number;
  subheadings: Subheading[];
}

export interface Subheading {
  title: string;
  context: string;
  page_reference: number;
  visual_references: VisualReference[];
}

export interface VisualReference {
  image_reference: string;
  image_caption: string;
  page_reference: number;
}

// ReactFlow node data
export interface DocumentNodeData {
  id?: string;
  label: string;
  level: number;
  pageReference: number;
  type?: string;
  context?: string;
  visualReferences?: VisualReference[];
}

// Custom node types
export type DocumentNodeTypes = "heading" | "subheading" | "sub-subheading";

// Custom ReactFlow node
export interface DocumentNode extends Node<DocumentNodeData> {
  type?: DocumentNodeTypes;
}

// Utility type for the document flow component
export interface DocumentFlowProps {
  documentId: string | null;
  onNodeClick?: (headingText: string, documentId: string, page: number) => void;
}
