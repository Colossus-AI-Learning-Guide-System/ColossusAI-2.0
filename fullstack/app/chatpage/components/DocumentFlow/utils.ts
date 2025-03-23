import { Node, Edge } from "reactflow";
import {
  DocumentNodeData,
  DocumentStructureResponse,
  Subheading,
} from "@/app/types/documentStructure";

// Constants for layout - increasing spacing for better visibility
export const VERTICAL_SPACING = 150;
export const HORIZONTAL_SPACING = 300;
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

  // Check if we're dealing with enhanced structure
  const isEnhanced = data.enhanced === true;

  console.log(
    `Processing document with name: ${
      data.document_name || data.title || "Unknown"
    }, Enhanced format: ${isEnhanced}`
  );

  // Create document root node
  const rootNodeId = "root";
  processedNodes.push({
    id: rootNodeId,
    type: "custom",
    position: { x: 0, y: 0 }, // Initial position, will be overridden by layout
    data: {
      id: rootNodeId,
      label: data.document_name || data.title || `Document ${documentId}`,
      level: 0,
      pageReference: 1,
    },
    sourcePosition: "bottom", // Add source position
    targetPosition: "top", // Add target position
  });

  // Process headings
  if (data.document_structure && data.document_structure.length > 0) {
    console.log(`Processing ${data.document_structure.length} main headings`);

    data.document_structure.forEach((item, index) => {
      console.log(
        `Processing heading: ${item.heading} with ${
          item.subheadings?.length || 0
        } subheadings`
      );

      // Create heading node
      const nodeId = createNodeId("heading", index);

      // Determine the level of the heading (either from the data or using our function)
      const headingLevel = item.level || determineHeadingLevel(item.heading);

      processedNodes.push({
        id: nodeId,
        type: "custom",
        position: { x: 0, y: (index + 1) * VERTICAL_SPACING }, // Use constant for spacing
        data: {
          id: nodeId,
          label: item.heading,
          level: headingLevel,
          pageReference: item.page_reference || 1,
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
        sourceHandle: "source",
        targetHandle: "target",
        style: { strokeWidth: 2, stroke: "#333" },
      });

      // Process subheadings if available
      if (item.subheadings && item.subheadings.length > 0) {
        // Function to recursively process subheadings with enhanced support
        const processSubheadings = (
          parentId: string,
          subheadings: Subheading[],
          parentIndex: number,
          level: number,
          xOffset: number
        ) => {
          subheadings.forEach((subheading, subIndex) => {
            // Create unique ID for this subheading
            const subNodeId = createNodeId(
              `subheading-${parentIndex}-${subIndex}`,
              subIndex
            );

            // Log subheading data for debugging
            console.log(
              `Processing subheading: index=${subIndex}, title=${
                subheading.title || "Untitled"
              }`
            );

            // Ensure we have a valid label
            const nodeLabel = subheading.title || "Untitled subheading";

            // Create node with enhanced data if available
            processedNodes.push({
              id: subNodeId,
              type: "custom",
              position: {
                x: xOffset, // Position based on nesting level
                y:
                  (parentIndex + 1) * VERTICAL_SPACING +
                  (subIndex + 1) * (VERTICAL_SPACING / 2), // Better vertical spacing
              },
              data: {
                id: subNodeId,
                label: nodeLabel,
                level: level, // Use the passed level
                pageReference: subheading.page_reference || 1,
                context: subheading.context, // Include context information if available
                visualReferences: subheading.visual_references, // Include visual references
              },
              sourcePosition: "bottom",
              targetPosition: "top",
            });

            // Connect to parent
            processedEdges.push({
              id: `edge-${parentId}-to-${subNodeId}`,
              source: parentId,
              target: subNodeId,
              type: "smoothstep",
              animated: false,
              sourceHandle: "source",
              targetHandle: "target",
              style: { strokeWidth: 2, stroke: "#333" },
            });

            // Process visual references in enhanced format (if enabled)
            if (
              isEnhanced &&
              subheading.visual_references &&
              subheading.visual_references.length > 0
            ) {
              subheading.visual_references.forEach((visual, visualIndex) => {
                const visualNodeId = createNodeId(
                  `visual-${parentIndex}-${subIndex}-${visualIndex}`,
                  visualIndex
                );

                // Create node for visual reference
                processedNodes.push({
                  id: visualNodeId,
                  type: "custom",
                  position: {
                    x: xOffset + HORIZONTAL_SPACING / 2, // Position to the right of the subheading
                    y:
                      (parentIndex + 1) * VERTICAL_SPACING +
                      (subIndex + 1) * (VERTICAL_SPACING / 2) +
                      (visualIndex + 1) * (VERTICAL_SPACING / 4), // Vertical spacing for visual
                  },
                  data: {
                    id: visualNodeId,
                    label: visual.image_caption || "Image",
                    level: level + 1, // Visual references are one level deeper
                    pageReference:
                      visual.page_reference || subheading.page_reference || 1,
                    type: "visual", // Mark as visual node type
                  },
                  sourcePosition: "bottom",
                  targetPosition: "top",
                });

                // Connect subheading to visual reference
                processedEdges.push({
                  id: `edge-${subNodeId}-to-${visualNodeId}`,
                  source: subNodeId,
                  target: visualNodeId,
                  type: "smoothstep",
                  animated: false,
                  sourceHandle: "source",
                  targetHandle: "target",
                  style: {
                    strokeWidth: 2,
                    stroke: "#333",
                    strokeDasharray: "5,5",
                  }, // Dashed line for visuals
                });
              });
            }

            // Recursively process any deeper subheadings (if available)
            if (subheading.subheadings && subheading.subheadings.length > 0) {
              processSubheadings(
                subNodeId,
                subheading.subheadings,
                parentIndex,
                level + 1,
                xOffset + HORIZONTAL_SPACING / 2 // Increase horizontal offset for deeper levels
              );
            }
          });
        };

        // Start processing subheadings with the current heading as parent
        processSubheadings(
          nodeId,
          item.subheadings,
          index,
          headingLevel + 1, // Use headingLevel instead of fixed (item.level || 1) + 1
          HORIZONTAL_SPACING
        );
      }
    });
  } else {
    console.warn("No document structure data found");
  }

  // Apply a better layout for presentation
  applyHierarchicalLayout(processedNodes);

  // Log the results
  console.log(
    `Generated ${processedNodes.length} nodes and ${processedEdges.length} edges`
  );

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

  // Position nodes by level with better spacing
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
