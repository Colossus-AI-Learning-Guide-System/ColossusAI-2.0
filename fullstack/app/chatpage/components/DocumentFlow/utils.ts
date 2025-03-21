import { Node, Edge } from "reactflow";
import {
  DocumentNodeData,
  DocumentStructureResponse,
  Subheading,
} from "@/app/types/documentStructure";

// Constants for layout
export const VERTICAL_SPACING = 120;
export const HORIZONTAL_SPACING = 250;
export const MAX_LEVEL = 5;

/**
 * Process document structure into ReactFlow nodes and edges
 */
export function processDocumentStructure(
  data: DocumentStructureResponse,
  docId: string
) {
  const processedNodes: Node<DocumentNodeData>[] = [];
  const processedEdges: Edge[] = [];

  if (!data.document_structure || data.document_structure.length === 0) {
    return { processedNodes, processedEdges };
  }

  const documentStructure = data.document_structure[0]; // Assume first structure

  // Root node (document title)
  const rootId = "root";
  processedNodes.push({
    id: rootId,
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      label: documentStructure.heading,
      level: 0,
      pageReference: documentStructure.page_reference,
    },
  });

  // Get all first-level headings to arrange them horizontally
  const firstLevelHeadings = documentStructure.subheadings || [];
  const headingCount = firstLevelHeadings.length;

  if (headingCount === 0) {
    return { processedNodes, processedEdges };
  }

  // Calculate starting X position to center the first level headings
  const startX = -(HORIZONTAL_SPACING * (headingCount - 1)) / 2;

  // First, create a map to track all created nodes to support subheading connections
  const nodeMap = new Map<string, string>(); // Title -> NodeId

  // Process first level headings
  firstLevelHeadings.forEach((heading, index) => {
    const headingId = `heading-${index}`;
    const xPos = startX + index * HORIZONTAL_SPACING;

    // Determine heading level from title format (e.g. "3.2" -> level 2)
    const level = determineHeadingLevel(heading.title);

    // Create node for this heading
    processedNodes.push({
      id: headingId,
      type: "custom",
      position: { x: xPos, y: VERTICAL_SPACING },
      data: {
        label: heading.title,
        level,
        pageReference: heading.page_reference,
      },
    });

    // Store node ID by title for later reference
    nodeMap.set(heading.title, headingId);

    // Connect to root
    processedEdges.push({
      id: `edge-root-to-${headingId}`,
      source: rootId,
      target: headingId,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#999" },
    });

    // Handle subheadings by parsing the title structure
    // For example, if we have "3.2 Attention" we would connect it to any "3.2.X" headings
  });

  // Now create edges between related headings based on numerical hierarchy
  createHierarchicalEdges(firstLevelHeadings, nodeMap, processedEdges);

  return { processedNodes, processedEdges };
}

/**
 * Determine heading level from its title
 * Examples: "1 Introduction" -> 1, "3.2 Method" -> 2, "3.2.1 Detail" -> 3
 */
export function determineHeadingLevel(title: string): number {
  // Default level is 1
  let level = 1;

  // Check if title starts with numbers and dots pattern
  const titleMatch = title.match(/^(\d+)(\.\d+)*/);
  if (titleMatch) {
    // Count the number of number segments to determine depth
    // e.g., "3.2.1" has 3 segments = level 3
    const segments = titleMatch[0].split(".");
    level = Math.min(segments.length, MAX_LEVEL);
  }

  return level;
}

/**
 * Create edges between related headings based on their numerical hierarchy
 */
function createHierarchicalEdges(
  headings: Subheading[],
  nodeMap: Map<string, string>,
  edges: Edge[]
) {
  // Create a map of heading prefix to heading object
  // e.g., "3.2" -> heading with title "3.2 Method"
  const headingPrefixMap = new Map<string, { title: string; nodeId: string }>();

  headings.forEach((heading) => {
    const nodeId = nodeMap.get(heading.title);
    if (!nodeId) return;

    const match = heading.title.match(/^(\d+(\.\d+)*)/);
    if (match) {
      const prefix = match[0];
      headingPrefixMap.set(prefix, { title: heading.title, nodeId });
    }
  });

  // Now connect each heading to its parent based on prefix
  headings.forEach((heading) => {
    const match = heading.title.match(/^(\d+(\.\d+)*)/);
    if (!match) return;

    const prefix = match[0];
    const lastDotIndex = prefix.lastIndexOf(".");

    // Skip if this is a top-level heading (no dots)
    if (lastDotIndex === -1) return;

    // Get parent prefix (e.g., for "3.2.1", parent is "3.2")
    const parentPrefix = prefix.substring(0, lastDotIndex);
    const parent = headingPrefixMap.get(parentPrefix);

    if (parent && nodeMap.has(heading.title)) {
      const sourceId = parent.nodeId;
      const targetId = nodeMap.get(heading.title)!;

      // Add edge from parent to this heading
      edges.push({
        id: `edge-${sourceId}-to-${targetId}`,
        source: sourceId,
        target: targetId,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#999" },
      });
    }
  });
}
