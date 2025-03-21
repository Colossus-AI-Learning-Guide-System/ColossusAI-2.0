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
 * Process document structure data into ReactFlow nodes and edges
 */
export const processDocumentStructure = (
  data: DocumentStructureResponse,
  documentId: string
) => {
  const processedNodes: Node<DocumentNodeData>[] = [];
  const processedEdges: Edge[] = [];

  // Function to generate unique node IDs
  const createNodeId = (type: string, index: number) => `${type}-${index}`;

  // Create document root node
  const rootNodeId = "root";
  processedNodes.push({
    id: rootNodeId,
    type: "custom",
    position: { x: 0, y: 0 }, // Initial position, will be overridden by layout
    data: {
      id: rootNodeId,
      label: data.document_name || `Document ${documentId}`,
      level: 0,
      pageReference: 1,
    },
    sourcePosition: "bottom", // Add source position
    targetPosition: "top", // Add target position
  });

  // Process headings
  if (data.document_structure && data.document_structure.length > 0) {
    data.document_structure.forEach((item, index) => {
      // Create heading node
      const nodeId = createNodeId("heading", index);
      processedNodes.push({
        id: nodeId,
        type: "custom",
        position: { x: 0, y: (index + 1) * 100 }, // Initial vertical layout
        data: {
          id: nodeId,
          label: item.heading,
          level: item.level || 1,
          pageReference: item.page_number || 1,
        },
        sourcePosition: "bottom", // Add source position
        targetPosition: "top", // Add target position
      });

      // Connect heading to root
      processedEdges.push({
        id: `edge-root-to-heading-${index}`,
        source: rootNodeId,
        target: nodeId,
        type: "smoothstep",
        animated: false,
        // Use explicit handle IDs that match the DOM elements in the CustomNode component
        sourceHandle: "source",
        targetHandle: "target",
      });

      // Process subheadings if available
      if (item.subheadings && item.subheadings.length > 0) {
        item.subheadings.forEach((subheading, subIndex) => {
          // Create subheading node
          const subNodeId = createNodeId(`subheading-${index}`, subIndex);
          processedNodes.push({
            id: subNodeId,
            type: "custom",
            position: {
              x: 150, // Offset to the right
              y: (index + 1) * 100 + (subIndex + 1) * 60, // Vertical layout
            },
            data: {
              id: subNodeId,
              label: subheading.heading,
              level: (item.level || 1) + 1, // One level deeper than parent
              pageReference: subheading.page_number || item.page_number || 1,
            },
            sourcePosition: "bottom", // Add source position
            targetPosition: "top", // Add target position
          });

          // Connect subheading to its parent heading
          processedEdges.push({
            id: `edge-heading-${index}-to-subheading-${subIndex}`,
            source: nodeId,
            target: subNodeId,
            type: "smoothstep",
            animated: false,
            // Use explicit handle IDs that match the DOM elements in the CustomNode component
            sourceHandle: "source",
            targetHandle: "target",
          });
        });
      }
    });
  }

  // Apply a better layout for presentation
  applyHierarchicalLayout(processedNodes);

  return { processedNodes, processedEdges };
};

/**
 * Apply a hierarchical layout to position nodes in a more organized way
 */
function applyHierarchicalLayout(nodes: Node<DocumentNodeData>[]) {
  // Group nodes by level
  const nodesByLevel = new Map<number, Node<DocumentNodeData>[]>();

  nodes.forEach((node) => {
    const level = node.data.level || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)?.push(node);
  });

  // Position nodes by level
  let yOffset = 0;
  Array.from(nodesByLevel.keys())
    .sort()
    .forEach((level) => {
      const levelNodes = nodesByLevel.get(level) || [];
      const xStep = levelNodes.length > 1 ? HORIZONTAL_SPACING : 0;
      const xStart = (-(levelNodes.length - 1) * xStep) / 2;

      levelNodes.forEach((node, index) => {
        node.position = {
          x: xStart + index * xStep,
          y: level * VERTICAL_SPACING,
        };
      });

      yOffset += VERTICAL_SPACING;
    });
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
