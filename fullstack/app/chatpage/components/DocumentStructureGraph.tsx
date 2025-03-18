"use client";

import React, { useState, useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import styles from "../page.module.css";

interface DocumentStructureProps {
  documentId: string | null;
}

interface DocumentStructureData {
  headings: string[];
  hierarchy: Record<string, string[]>;
}

interface GraphNode {
  name: string;
  value: number;
  children?: GraphNode[];
}

const DocumentStructureGraph: React.FC<DocumentStructureProps> = ({
  documentId,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Transform API data to graph format
  const transformDocumentStructure = (
    data: DocumentStructureData
  ): GraphNode => {
    const rootNode: GraphNode = {
      name: "Document",
      value: 1,
      children: [],
    };

    // Add heading nodes
    data.headings.forEach((heading) => {
      const headingNode: GraphNode = {
        name: heading,
        value: 0.8,
        children: [],
      };

      // Add subheading nodes
      if (data.hierarchy[heading] && data.hierarchy[heading].length > 0) {
        data.hierarchy[heading].forEach((subheading) => {
          headingNode.children?.push({
            name: subheading,
            value: 0.5,
          });
        });
      }

      rootNode.children?.push(headingNode);
    });

    return rootNode;
  };

  useEffect(() => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    fetch(`http://127.0.0.1:5002/api/structure/document/${documentId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch document structure");
        return response.json();
      })
      .then((data) => {
        console.log("API response:", data);
        const transformedData = transformDocumentStructure(data);
        console.log("Transformed data:", transformedData);

        if (chartRef.current) {
          // Clear previous chart if it exists
          if (rootRef.current) {
            rootRef.current.dispose();
          }

          // Create root element
          const root = am5.Root.new(chartRef.current);
          rootRef.current = root;

          // Set themes
          root.setThemes([am5themes_Animated.new(root)]);

          // Create chart
          const chart = root.container.children.push(
            am5hierarchy.ForceDirected.new(root, {
              downDepth: 1,
              initialDepth: 2,
              valueField: "value",
              categoryField: "name",
              childDataField: "children",
              centerStrength: 0.5,
              minRadius: 20,
              maxRadius: 35,
              manyBodyStrength: -15,
              linkWithStrength: 0.3,
            })
          );

          // Configure nodes
          const nodeTemplate = chart.nodes.template;

          // Node colors based on level
          nodeTemplate.adapters.add("fill", (fill, target) => {
            const dataItem = target.dataItem as any;
            if (dataItem) {
              const depth = dataItem.get("depth");
              if (depth === 0) return am5.color(0x4285f4); // Document - blue
              if (depth === 1) return am5.color(0xea4335); // Headings - red
              return am5.color(0xfbbc05); // Subheadings - yellow
            }
            return fill;
          });

          // Configure labels
          nodeTemplate.set("tooltipText", "{name}");
          nodeTemplate.label.setAll({
            text: "{name}",
            fontSize: 12,
            fill: am5.color(0xffffff),
            strokeOpacity: 0,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 2,
            paddingBottom: 2,
            background: am5.RoundedRectangle.new(root, {
              fill: am5.color(0x000000),
              fillOpacity: 0.7,
            }),
          });

          // Set data
          chart.data.setAll([transformedData]);

          // Make stuff animate on load
          chart.appear(1000, 100);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching document structure:", err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
      }
    };
  }, [documentId]);

  if (loading)
    return (
      <div className={styles["graph-loading"]}>
        Loading document structure...
      </div>
    );
  if (error) return <div className={styles["graph-error"]}>Error: {error}</div>;
  if (!documentId)
    return (
      <div className={styles["graph-empty"]}>
        Select a document to view its structure
      </div>
    );

  return (
    <div className={styles["document-graph-container"]}>
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default DocumentStructureGraph;
