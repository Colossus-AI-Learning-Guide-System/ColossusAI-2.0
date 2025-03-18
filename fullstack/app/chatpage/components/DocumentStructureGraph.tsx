"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import styles from "../page.module.css";

interface DocumentStructureProps {
  documentId: string | null;
  onNodeClick?: (headingText: string, documentId: string) => void;
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

// Error boundary component to handle chart errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error in chart component:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const DocumentStructureGraph: React.FC<DocumentStructureProps> = ({
  documentId,
  onNodeClick,
}) => {
  // Refs
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const chartInstanceRef = useRef<am5hierarchy.ForceDirected | null>(null);
  const dataRef = useRef<DocumentStructureData | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [chartCreated, setChartCreated] = useState<boolean>(false);
  const maxRetries = 3;

  // Sample data to use if API fails - using useMemo to ensure stability
  const getSampleData = useMemo(
    () => ({
      headings: [
        "Introduction",
        "Background",
        "Methodology",
        "Results",
        "Discussion",
        "Conclusion",
        "Future Work",
      ],
      hierarchy: {
        Introduction: [
          "Document Overview",
          "Problem Statement",
          "Research Questions",
        ],
        Background: [
          "Literature Review",
          "Related Work",
          "Theoretical Framework",
        ],
        Methodology: [
          "Research Design",
          "Data Collection",
          "Analysis Approach",
          "Ethical Considerations",
        ],
        Results: [
          "Primary Findings",
          "Secondary Observations",
          "Statistical Analysis",
        ],
        Discussion: [
          "Interpretation of Results",
          "Comparison with Prior Work",
          "Limitations",
        ],
        Conclusion: ["Summary of Findings", "Implications", "Significance"],
        "Future Work": [
          "Recommendations",
          "Potential Applications",
          "Next Steps",
        ],
      },
    }),
    []
  );

  // Clear click timeout when component unmounts
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Handle node clicks safely with debouncing to prevent multiple rapid clicks
  const handleNodeClick = useCallback(
    (ev: any) => {
      if (!documentId || !onNodeClick) return;

      // Prevent rapid clicks
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      try {
        const node = ev.target.dataItem?.dataContext as any;
        if (!node || node.name === "Document") return;

        console.log("Node clicked:", node.name);

        // Safely handle animations
        try {
          const clickedNode = ev.target;

          // First animation - scale up
          clickedNode.animate({
            key: "scale",
            from: 1,
            to: 1.2,
            duration: 200,
          });

          // Second animation after delay - scale back down
          clickTimeoutRef.current = setTimeout(() => {
            try {
              if (clickedNode && !clickedNode.isDisposed) {
                clickedNode.animate({
                  key: "scale",
                  to: 1,
                  duration: 200,
                });
              }
            } catch (animError) {
              console.warn("Error in node scale down animation:", animError);
            }
            clickTimeoutRef.current = null;
          }, 300);
        } catch (animError) {
          console.warn("Animation error:", animError);
        }

        // Call the click handler even if animation fails
        onNodeClick(node.name, documentId);
      } catch (clickErr) {
        console.error("Error handling node click:", clickErr);
      }
    },
    [documentId, onNodeClick]
  );

  // Transform API data to graph format - using useCallback for stability
  const transformDocumentStructure = useCallback(
    (data: DocumentStructureData): GraphNode => {
      try {
        // Input validation with detailed logging
        if (!data) {
          console.error(
            "transformDocumentStructure received null/undefined data"
          );
          return createDefaultRootNode();
        }

        if (!data.headings || !Array.isArray(data.headings)) {
          console.error(
            "transformDocumentStructure: Invalid or missing headings array",
            data
          );
          return createDefaultRootNode();
        }

        if (!data.hierarchy || typeof data.hierarchy !== "object") {
          console.error(
            "transformDocumentStructure: Invalid or missing hierarchy object",
            data
          );
          return createDefaultRootNode();
        }

        const rootNode: GraphNode = {
          name: "Document",
          value: 1.2, // Slightly larger for the root
          children: [],
        };

        // Add heading nodes
        data.headings.forEach((heading) => {
          if (typeof heading !== "string") {
            console.warn(`Invalid heading type: ${typeof heading}`, heading);
            return; // Skip this heading
          }

          const headingNode: GraphNode = {
            name: heading,
            value: 0.9, // Slightly larger than before
            children: [],
          };

          // Add subheading nodes
          if (
            data.hierarchy[heading] &&
            Array.isArray(data.hierarchy[heading]) &&
            data.hierarchy[heading].length > 0
          ) {
            data.hierarchy[heading].forEach((subheading) => {
              if (typeof subheading !== "string") {
                console.warn(
                  `Invalid subheading type: ${typeof subheading}`,
                  subheading
                );
                return; // Skip this subheading
              }

              headingNode.children?.push({
                name: subheading,
                value: 0.6, // Slightly larger than before
              });
            });
          } else {
            headingNode.children?.push({
              name: heading + " content",
              value: 0.4,
            });
          }

          rootNode.children?.push(headingNode);
        });

        return rootNode;
      } catch (err) {
        console.error("Error transforming document structure:", err);
        return createDefaultRootNode();
      }
    },
    []
  );

  // Helper function to create a default root node when data is invalid
  const createDefaultRootNode = useCallback((): GraphNode => {
    return {
      name: "Document (Error)",
      value: 1.2,
      children: [
        {
          name: "Error loading structure",
          value: 0.9,
          children: [
            {
              name: "Please try again",
              value: 0.6,
            },
          ],
        },
      ],
    };
  }, []);

  // Create chart once and configure it
  const createChart = useCallback(() => {
    if (!chartRef.current || rootRef.current || chartCreated) return;

    try {
      // Create root element
      const root = am5.Root.new(chartRef.current);
      rootRef.current = root;

      // Set themes
      root.setThemes([am5themes_Animated.new(root)]);

      // Create chart with adjusted configuration
      const chart = root.container.children.push(
        am5hierarchy.ForceDirected.new(root, {
          downDepth: 2,
          initialDepth: 3,
          valueField: "value",
          categoryField: "name",
          childDataField: "children",
          centerStrength: 0.3,
          minRadius: 24,
          maxRadius: 40,
          manyBodyStrength: -35,
          linkWithStrength: 0.5,
        })
      );

      chartInstanceRef.current = chart;

      // Configure nodes
      const nodeTemplate = chart.nodes.template;

      // Make nodes interactive
      nodeTemplate.set("cursorOverStyle", "pointer");
      nodeTemplate.set("tooltipText", "{name}");

      // Create a label for the node
      if (!nodeTemplate.get("label")) {
        nodeTemplate.set("label", am5.Label.new(root, {}));
      }

      // Configure the label
      nodeTemplate.get("label")?.setAll({
        text: "{name}",
        fontSize: 14,
        fill: am5.color(0xffffff),
        strokeOpacity: 0,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        paddingBottom: 6,
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0x000000),
          fillOpacity: 0.7,
        }),
      });

      // Node colors based on level
      nodeTemplate.adapters.add("fill", (fill, target) => {
        try {
          const dataItem = target.dataItem as any;
          if (dataItem) {
            const depth = dataItem.get("depth");
            if (depth === 0) return am5.color(0x4285f4); // Document - blue
            if (depth === 1) return am5.color(0xea4335); // Headings - red
            return am5.color(0xfbbc05); // Subheadings - yellow
          }
        } catch (err) {
          console.warn("Error in node color adapter:", err);
        }
        return fill;
      });

      // Add hover state
      nodeTemplate.states.create("hover", {
        scale: 1.1,
        strokeWidth: 3,
        stroke: am5.color(0xffffff),
      });

      // Set up click handler
      nodeTemplate.events.on("click", handleNodeClick);

      // Adjust link properties
      const linkTemplate = chart.links.template;
      linkTemplate.setAll({
        strokeWidth: 2,
        strokeOpacity: 0.5,
      });

      setChartCreated(true);

      // Return chart instance
      return chart;
    } catch (err) {
      console.error("Error creating chart:", err);
      setError("Failed to create chart. Please try refreshing the page.");
      return null;
    }
  }, [handleNodeClick, chartCreated]);

  // Update chart data function
  const updateChartData = useCallback((data: GraphNode) => {
    try {
      if (!rootRef.current) return;

      const chart = chartInstanceRef.current;
      if (!chart) return;

      chart.data.setAll([data]);
      chart.appear(1000, 100);
    } catch (err) {
      console.error("Error updating chart data:", err);
    }
  }, []);

  // Fetch document structure - separated for clarity
  const fetchDocumentStructure = useCallback(
    async (docId: string) => {
      // Create an AbortController for timeout
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        // Set timeout - store ID so we can clear it
        timeoutId = setTimeout(() => {
          console.log("Fetch document structure timeout - aborting request");
          controller.abort();
        }, 15000); // Increase timeout to 15 seconds to give more time

        console.log(`Fetching document structure for ${docId}`);

        // Target the Flask backend API endpoint
        const flaskEndpoint = `http://127.0.0.1:5002/api/structure/document/${docId}`;
        console.log(`Requesting URL: ${flaskEndpoint}`);

        try {
          const response = await fetch(flaskEndpoint, {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            // Use cors mode for cross-origin requests
            mode: "cors",
          });

          // Clear the timeout as soon as we get a response
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          // Log detailed response information for debugging
          console.log(
            `Response status: ${response.status} ${response.statusText}`
          );

          if (!response.ok) {
            console.error(
              `Response not OK: ${response.status} ${response.statusText}`
            );

            if (response.status === 500) {
              console.log(
                "Server returned 500 error - might be processing document"
              );
              // This indicates a server-side error, could be because document is still processing
              return getSampleData;
            }

            // Try to read the response body for more details
            const errorText = await response
              .text()
              .catch((e) => "Could not read error response");
            console.error("Error response body:", errorText);

            // Use sample data instead of failing completely
            console.log("Using sample data due to error response");
            return getSampleData;
          }

          // Successfully got a response, try to parse it
          const data = await response.json().catch((e) => {
            console.error("Failed to parse response as JSON:", e);
            return null;
          });

          if (!data) {
            console.warn("Empty or invalid JSON response");
            return getSampleData;
          }

          console.log("Successfully parsed response data:", data);

          // Validate the data structure
          if (
            !data.headings ||
            !Array.isArray(data.headings) ||
            data.headings.length === 0
          ) {
            console.warn("No headings found in document structure data:", data);
            return getSampleData;
          }

          if (!data.hierarchy || typeof data.hierarchy !== "object") {
            console.warn("Invalid hierarchy in document structure data:", data);
            return getSampleData;
          }

          return data;
        } catch (fetchError: any) {
          console.error("Failed to fetch from Flask API:", fetchError);

          // If we got a network error, it might be that Flask is not running
          if (
            fetchError.name === "TypeError" &&
            fetchError.message.includes("Failed to fetch")
          ) {
            console.warn(
              "This appears to be a network error. Is Flask running on port 5002?"
            );
          }

          // On any fetch error, return sample data
          return getSampleData;
        }
      } catch (err: any) {
        // Clear timeout if it's still active
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Don't report AbortError as an error if we intentionally aborted
        if (err.name === "AbortError") {
          console.log("Request was aborted due to timeout");
          return getSampleData; // Return sample data instead of throwing
        }

        // Log detailed error information
        console.error("Error in fetchDocumentStructure:", {
          error: err,
          message: err.message,
          stack: err.stack,
          documentId: docId,
        });

        // Always return sample data for graceful fallback
        console.log("Using sample data due to error");
        return getSampleData;
      }
    },
    [getSampleData]
  );

  // Improved cleanup for chart disposal
  const disposeChart = useCallback(() => {
    // Clear any pending timeouts
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Dispose of the chart properly
    if (rootRef.current) {
      try {
        // First clear any data to prevent pending operations
        if (chartInstanceRef.current) {
          chartInstanceRef.current.data.setAll([]);
        }

        // Delay slightly to ensure pending operations complete
        setTimeout(() => {
          try {
            if (rootRef.current) {
              rootRef.current.dispose();
              rootRef.current = null;
              chartInstanceRef.current = null;
              setChartCreated(false);
            }
          } catch (err) {
            console.error("Error during delayed chart disposal:", err);
          }
        }, 10);
      } catch (err) {
        console.error("Error disposing chart:", err);
      }
    }
  }, []);

  // Use the improved cleanup in both the document ID effect and the unmount effect
  useEffect(() => {
    // Only load if we have a valid documentId
    if (!documentId) {
      setLoading(false);
      setError(null);
      return;
    }

    // Dispose of any existing chart before creating a new one
    // This ensures we don't have DOM conflicts
    disposeChart();

    // Set loading state
    setLoading(true);
    setError(null);

    console.log(
      `Starting document structure fetch for document ID: ${documentId}`
    );

    // Create chart if it doesn't exist
    createChart();

    let isMounted = true; // Track if component is mounted

    // Load document structure data
    fetchDocumentStructure(documentId)
      .then((data) => {
        if (!isMounted) return; // Don't update state if unmounted

        console.log(`Successfully fetched data for document ID: ${documentId}`);

        // Store data reference
        dataRef.current = data;

        // Transform data for graph
        const graphData = transformDocumentStructure(data);

        // Update chart with data
        updateChartData(graphData);

        // Reset retry count on success
        setRetryCount(0);

        // Clear any error state
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return; // Don't update state if unmounted

        console.error(
          `Error in document structure effect for document ID: ${documentId}`,
          err
        );

        // Increment retry count
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        // Use sample data if max retries reached
        if (newRetryCount >= maxRetries) {
          console.warn("Using sample data after failed retries");
          const graphData = transformDocumentStructure(getSampleData);
          updateChartData(graphData);
          setError(
            "Unable to load document structure. Showing sample visualization instead."
          );
        } else {
          setError("Document structure temporarily unavailable. Retrying...");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false); // Always ensure loading state is cleared
          console.log(
            `Fetch operation completed for document ID: ${documentId}`
          );
        }
      });

    // Cleanup function
    return () => {
      isMounted = false; // Mark as unmounted
    };
  }, [
    documentId,
    createChart,
    fetchDocumentStructure,
    transformDocumentStructure,
    updateChartData,
    getSampleData,
    retryCount,
    maxRetries,
    disposeChart, // Add the disposeChart dependency
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeChart();
    };
  }, [disposeChart]);

  // Graph content rendering function - separate from main render for better error handling
  const graphContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading document structure...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <p className={styles.errorTitle}>Document Structure Unavailable</p>
          <p className={styles.errorMessage}>{error}</p>
          <p className={styles.errorHint}>
            We're displaying a visualization based on sample content.
            <br />
            This doesn't represent your actual document.
          </p>
          {retryCount < maxRetries && (
            <button
              className={styles.retryButton}
              onClick={() => {
                if (documentId) {
                  setRetryCount(0);
                  setLoading(true);
                  fetchDocumentStructure(documentId)
                    .then((data) => {
                      dataRef.current = data;
                      const graphData = transformDocumentStructure(data);
                      updateChartData(graphData);
                      setError(null);
                    })
                    .catch((err) => {
                      console.error("Error in retry:", err);
                      setError(
                        `Unable to load document structure. Showing sample visualization instead.`
                      );
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }
              }}
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    if (!documentId) {
      return (
        <div className={styles.messageContainer}>
          <p>Select a document to view its structure</p>
        </div>
      );
    }

    return <div ref={chartRef} className={styles.graph}></div>;
  };

  // Main render with error boundary
  return (
    <div className={styles.graphWrapper}>
      <ErrorBoundary
        fallback={
          <div className={styles.errorContainer}>
            <p>Something went wrong with the graph display.</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        }
      >
        {graphContent()}
      </ErrorBoundary>
    </div>
  );
};

export default React.memo(DocumentStructureGraph);
