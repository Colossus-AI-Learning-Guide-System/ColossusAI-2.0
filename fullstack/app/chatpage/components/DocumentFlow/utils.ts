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
  const nodeIdMap = new Map<string, string>(); // Maps content to nodeId to avoid duplicates

  // Function to generate unique node IDs
  const createNodeId = (prefix: string, index: number) => `${prefix}-${index}`;

  // Check if we're dealing with enhanced structure
  const isEnhanced = data.enhanced === true;

  console.log(
    `Processing document with name: ${
      data.document_name || data.title || "Unknown"
    }, Enhanced format: ${isEnhanced}`
  );

  // Process document structure
  if (data.document_structure && data.document_structure.length > 0) {
    console.log(`Processing ${data.document_structure.length} main headings`);

    // First pass - create all nodes
    let currentY = 0;
    let nextHeadingY = 0;

    data.document_structure.forEach((section, sectionIndex) => {
      if (!section.heading) {
        console.warn(`Section ${sectionIndex} is missing a heading`);
        return;
      }

      // Set Y position for this heading
      currentY = nextHeadingY;

      // Create main heading node
      const headingId = createNodeId("heading", sectionIndex);
      // If this is the first heading (top parent node), make it level 0, otherwise level 1
      const headingLevel = sectionIndex === 0 ? 0 : 1;

      processedNodes.push({
        id: headingId,
        type: "custom",
        position: { x: 0, y: currentY },
        data: {
          id: headingId,
          label: section.heading,
          level: headingLevel,
          pageReference: section.page_reference || 1,
        },
        sourcePosition: "bottom",
        targetPosition: "top",
      });

      nodeIdMap.set(section.heading, headingId);

      // Track the Y position after processing this heading and its subheadings
      let sectionHeight = VERTICAL_SPACING;

      // Process subheadings recursively
      if (section.subheadings && section.subheadings.length > 0) {
        // Calculate height needed for this section's subheadings
        const { height, lastNodeY } = processSubheadingSection(
          section.subheadings,
          headingId,
          sectionIndex,
          currentY + VERTICAL_SPACING,
          headingLevel + 1,
          0,
          processedNodes,
          processedEdges,
          nodeIdMap
        );

        // Adjust the next heading Y position based on the height of this section
        sectionHeight = Math.max(sectionHeight, height);
        nextHeadingY = Math.max(nextHeadingY, lastNodeY) + VERTICAL_SPACING;
      } else {
        nextHeadingY = currentY + VERTICAL_SPACING;
      }

      // If this isn't the first heading, connect it to the previous heading
      if (sectionIndex > 0) {
        const prevHeadingId = createNodeId("heading", sectionIndex - 1);
        processedEdges.push({
          id: `edge-${prevHeadingId}-to-${headingId}`,
          source: prevHeadingId,
          target: headingId,
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 2, stroke: "#333" },
        });
      }
    });
  } else {
    console.warn("No document structure data found");

    // Create an empty heading if none exists
    processedNodes.push({
      id: "empty",
      type: "custom",
      position: { x: 0, y: 0 },
      data: {
        id: "empty",
        label: data.document_name || data.title || `Document ${documentId}`,
        level: 0,
        pageReference: 1,
      },
      sourcePosition: "bottom",
      targetPosition: "top",
    });
  }

  // Perform additional layout optimization to prevent edge/node overlap
  optimizeLayout(processedNodes, processedEdges);

  console.log(
    `Generated ${processedNodes.length} nodes and ${processedEdges.length} edges`
  );

  return { processedNodes, processedEdges };
};

/**
 * Process a group of subheadings and their children
 * Returns the total height taken by this subheading section and the last node's Y position
 */
function processSubheadingSection(
  subheadings: Subheading[],
  parentId: string,
  sectionIndex: number,
  startY: number,
  level: number,
  xOffset: number,
  nodes: Node<DocumentNodeData>[],
  edges: Edge[],
  nodeIdMap: Map<string, string>
): { height: number; lastNodeY: number } {
  let currentY = startY;
  let maxChildY = startY;
  let totalHeight = 0;

  // Determine x coordinate for this level
  const xPos =
    level % 2 === 0
      ? xOffset - HORIZONTAL_SPACING // Even levels go left
      : xOffset + HORIZONTAL_SPACING; // Odd levels go right

  subheadings.forEach((subheading, subIndex) => {
    if (!subheading.title) {
      console.warn(
        `Subheading ${subIndex} in section ${sectionIndex} is missing a title`
      );
      return;
    }

    // Create node ID and add node
    const nodeId = `subheading-${sectionIndex}-${level}-${subIndex}`;

    nodes.push({
      id: nodeId,
      type: "custom",
      position: { x: xPos, y: currentY },
      data: {
        id: nodeId,
        label: subheading.title,
        level: level,
        pageReference: subheading.page_reference || 1,
        context: subheading.context || "",
      },
      sourcePosition: "bottom",
      targetPosition: "top",
    });

    nodeIdMap.set(subheading.title, nodeId);

    // Connect to parent
    edges.push({
      id: `edge-${parentId}-to-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "smoothstep",
      animated: false,
      style: { strokeWidth: 2, stroke: "#333" },
    });

    let lastNodeY = currentY;
    let additionalHeight = 0;

    // Process visual references
    if (
      subheading.visual_references &&
      subheading.visual_references.length > 0
    ) {
      const visualStartY = currentY + VERTICAL_SPACING / 2;
      let visualY = visualStartY;

      subheading.visual_references.forEach((visual, visualIndex) => {
        const visualNodeId = `visual-${sectionIndex}-${level}-${subIndex}-${visualIndex}`;

        nodes.push({
          id: visualNodeId,
          type: "custom",
          position: {
            x: xPos + HORIZONTAL_SPACING / 2,
            y: visualY,
          },
          data: {
            id: visualNodeId,
            label: visual.image_caption || "Image",
            level: level,
            pageReference:
              visual.page_reference || subheading.page_reference || 1,
            type: "visual",
          },
          sourcePosition: "bottom",
          targetPosition: "top",
        });

        edges.push({
          id: `edge-${nodeId}-to-${visualNodeId}`,
          source: nodeId,
          target: visualNodeId,
          type: "smoothstep",
          animated: false,
          style: {
            strokeWidth: 2,
            stroke: "#333",
            strokeDasharray: "5,5",
          },
        });

        visualY += VERTICAL_SPACING / 2;
      });

      if (subheading.visual_references.length > 0) {
        additionalHeight =
          (subheading.visual_references.length * VERTICAL_SPACING) / 2;
        lastNodeY = visualY - VERTICAL_SPACING / 2;
      }
    }

    // Process nested subheadings recursively
    if (subheading.subheadings && subheading.subheadings.length > 0) {
      const { height, lastNodeY: childLastY } = processSubheadingSection(
        subheading.subheadings,
        nodeId,
        sectionIndex,
        currentY + VERTICAL_SPACING / 2,
        level + 1,
        xPos,
        nodes,
        edges,
        nodeIdMap
      );

      additionalHeight = Math.max(additionalHeight, height);
      lastNodeY = Math.max(lastNodeY, childLastY);
    }

    // Update maximum Y position
    maxChildY = Math.max(maxChildY, lastNodeY);

    // Move current Y position for next sibling
    currentY = lastNodeY + VERTICAL_SPACING;
    totalHeight += VERTICAL_SPACING + additionalHeight;
  });

  return {
    height: totalHeight,
    lastNodeY: maxChildY,
  };
}

/**
 * Optimize the layout to prevent edge-node overlaps and improve readability
 */
function optimizeLayout(nodes: Node<DocumentNodeData>[], edges: Edge[]) {
  // Create a map of node positions to check for overlaps
  const nodePositions = new Map<
    string,
    {
      node: Node<DocumentNodeData>;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  >();

  // Approximate node dimensions based on level/type
  nodes.forEach((node) => {
    const level = node.data.level || 0;
    const isVisual = node.data.type === "visual";

    // Estimate node dimensions based on content and type
    const width = isVisual ? 150 : node.data.label.length * 10 + 40;
    const height = isVisual ? 80 : 50;

    nodePositions.set(node.id, {
      node,
      x: node.position.x,
      y: node.position.y,
      width,
      height,
    });
  });

  // Check if any edges intersect with nodes and adjust node positions if needed
  edges.forEach((edge) => {
    const sourceNode = nodePositions.get(edge.source);
    const targetNode = nodePositions.get(edge.target);

    if (sourceNode && targetNode) {
      // Simple bounding box for edge path (not perfect but a reasonable approximation)
      const edgeMinX = Math.min(sourceNode.x, targetNode.x);
      const edgeMaxX = Math.max(sourceNode.x, targetNode.x);
      const edgeMinY = Math.min(sourceNode.y, targetNode.y);
      const edgeMaxY = Math.max(sourceNode.y, targetNode.y);

      // Check if any node (other than source and target) overlaps with this edge path
      nodePositions.forEach((nodePos, nodeId) => {
        if (nodeId !== edge.source && nodeId !== edge.target) {
          // Simple overlap check (not perfect for curved edges but helps)
          const nodeMinX = nodePos.x - nodePos.width / 2;
          const nodeMaxX = nodePos.x + nodePos.width / 2;
          const nodeMinY = nodePos.y - nodePos.height / 2;
          const nodeMaxY = nodePos.y + nodePos.height / 2;

          // Check if node bounding box intersects edge bounding box
          if (
            nodeMaxX > edgeMinX &&
            nodeMinX < edgeMaxX &&
            nodeMaxY > edgeMinY &&
            nodeMinY < edgeMaxY
          ) {
            // Move the node slightly to avoid overlap
            const isHorizontalOverlap =
              edgeMaxX - edgeMinX > edgeMaxY - edgeMinY;

            if (isHorizontalOverlap) {
              // Move node vertically to avoid horizontal edge
              nodePos.node.position.y += VERTICAL_SPACING / 3;
            } else {
              // Move node horizontally to avoid vertical edge
              nodePos.node.position.x += HORIZONTAL_SPACING / 3;
            }
          }
        }
      });
    }
  });

  // Apply corrected positions back to the nodes
  nodePositions.forEach((nodePos, nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      node.position = {
        x: nodePos.node.position.x,
        y: nodePos.node.position.y,
      };
    }
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
