import { Node, Edge } from "reactflow";
import {
  DocumentNodeData,
  DocumentStructureResponse,
  Subheading,
} from "@/app/types/documentStructure";

// Constants for layout - increasing spacing for better visibility
export const VERTICAL_SPACING = 200;
export const HORIZONTAL_SPACING = 350;
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

  // Count total subheadings for balanced distribution
  const totalSubheadings = subheadings.length;

  // Process subheadings with alternating sides for better distribution
  subheadings.forEach((subheading, subIndex) => {
    if (!subheading.title) {
      console.warn(
        `Subheading ${subIndex} in section ${sectionIndex} is missing a title`
      );
      return;
    }

    // Create node ID and add node
    const nodeId = `subheading-${sectionIndex}-${level}-${subIndex}`;

    // Alternate sides for better distribution
    // For level 2:
    // - Even indices go left
    // - Odd indices go right
    // For level 3+:
    // - Use parent's offset plus additional offset

    let xPos;
    if (level === 2) {
      // Distribute level 2 subheadings evenly to left and right
      xPos =
        subIndex % 2 === 0
          ? -HORIZONTAL_SPACING // Even indices go left
          : HORIZONTAL_SPACING; // Odd indices go right
    } else if (level > 2) {
      // For deeper levels, alternate position relative to parent
      // This creates a cascading effect for deeper nesting
      const direction = subIndex % 2 === 0 ? -1 : 1;
      xPos = xOffset + direction * HORIZONTAL_SPACING * 0.7;
    } else {
      // Level 1 (fallback) - should not usually be used in this context
      xPos = xOffset + HORIZONTAL_SPACING;
    }

    // Add extra vertical spacing between nodes (scaled by level)
    const verticalSpacingFactor = Math.max(1, 0.7 + level * 0.1);

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

    // Connect to parent with improved edge
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

      // Determine whether visuals go left or right of the subheading
      const visualXOffset =
        subIndex % 2 === 0 ? -HORIZONTAL_SPACING / 3 : HORIZONTAL_SPACING / 3;

      subheading.visual_references.forEach((visual, visualIndex) => {
        const visualNodeId = `visual-${sectionIndex}-${level}-${subIndex}-${visualIndex}`;

        nodes.push({
          id: visualNodeId,
          type: "custom",
          position: {
            x: xPos + visualXOffset,
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

        visualY += VERTICAL_SPACING / 1.5; // Increased spacing between visuals
      });

      if (subheading.visual_references.length > 0) {
        additionalHeight =
          (subheading.visual_references.length * VERTICAL_SPACING) / 1.5;
        lastNodeY = visualY - VERTICAL_SPACING / 1.5;
      }
    }

    // Process nested subheadings recursively
    if (subheading.subheadings && subheading.subheadings.length > 0) {
      const { height, lastNodeY: childLastY } = processSubheadingSection(
        subheading.subheadings,
        nodeId,
        sectionIndex,
        currentY + VERTICAL_SPACING / 1.5, // Increased spacing for hierarchy
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

    // Move current Y position for next sibling with additional spacing based on level
    currentY = lastNodeY + VERTICAL_SPACING * verticalSpacingFactor;
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
    // Increased size for better visibility
    const width = isVisual
      ? 150
      : Math.min(300, node.data.label.length * 12 + 50);
    const height = isVisual
      ? 80
      : Math.min(100, 30 + (node.data.label.length / 15) * 10);

    nodePositions.set(node.id, {
      node,
      x: node.position.x,
      y: node.position.y,
      width,
      height,
    });
  });

  // Perform multiple passes to detect and resolve overlaps
  for (let pass = 0; pass < 3; pass++) {
    let overlapsFound = false;

    // First check for node-node overlaps
    const nodeIds = Array.from(nodePositions.keys());

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const nodeA = nodePositions.get(nodeIds[i]);
        const nodeB = nodePositions.get(nodeIds[j]);

        if (!nodeA || !nodeB) continue;

        // Check if nodes overlap
        const overlapX =
          Math.abs(nodeA.x - nodeB.x) < (nodeA.width + nodeB.width) / 2;
        const overlapY =
          Math.abs(nodeA.y - nodeB.y) < (nodeA.height + nodeB.height) / 2;

        if (overlapX && overlapY) {
          overlapsFound = true;

          // Determine best direction to move (horizontal/vertical)
          const xOverlap =
            (nodeA.width + nodeB.width) / 2 - Math.abs(nodeA.x - nodeB.x);
          const yOverlap =
            (nodeA.height + nodeB.height) / 2 - Math.abs(nodeA.y - nodeB.y);

          if (xOverlap < yOverlap) {
            // Move horizontally - away from each other
            const direction = nodeA.x < nodeB.x ? -1 : 1;
            nodeA.node.position.x += direction * (xOverlap / 2 + 10);
            nodeB.node.position.x -= direction * (xOverlap / 2 + 10);
          } else {
            // Move vertically - away from each other
            const direction = nodeA.y < nodeB.y ? -1 : 1;
            nodeA.node.position.y += direction * (yOverlap / 2 + 10);
            nodeB.node.position.y -= direction * (yOverlap / 2 + 10);
          }

          // Update position in map
          nodeA.x = nodeA.node.position.x;
          nodeA.y = nodeA.node.position.y;
          nodeB.x = nodeB.node.position.x;
          nodeB.y = nodeB.node.position.y;
        }
      }
    }

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
              overlapsFound = true;

              // Move the node to avoid overlap
              const isHorizontalOverlap =
                edgeMaxX - edgeMinX > edgeMaxY - edgeMinY;

              if (isHorizontalOverlap) {
                // Move node vertically to avoid horizontal edge
                const direction =
                  nodePos.y < (edgeMinY + edgeMaxY) / 2 ? -1 : 1;
                nodePos.node.position.y += direction * (VERTICAL_SPACING / 2);
              } else {
                // Move node horizontally to avoid vertical edge
                const direction =
                  nodePos.x < (edgeMinX + edgeMaxX) / 2 ? -1 : 1;
                nodePos.node.position.x += direction * (HORIZONTAL_SPACING / 2);
              }

              // Update position in map
              nodePos.x = nodePos.node.position.x;
              nodePos.y = nodePos.node.position.y;
            }
          }
        });
      }
    });

    // If no overlaps were found, we can stop early
    if (!overlapsFound) break;
  }
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
