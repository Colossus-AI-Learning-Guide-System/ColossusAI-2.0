"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
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

// Add a useIsomorphicLayoutEffect to handle SSR environments
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Create a custom hook to check if the DOM element is mounted and ready
const useIsMounted = () => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

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
  const containerReadyRef = useRef<boolean>(false);

  // Use our custom hook
  const isMounted = useIsMounted();

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

  // Create chart once and configure it
  const createChart = useCallback(() => {
    if (!chartRef.current) {
      console.log("Cannot create chart - chart ref doesn't exist");
      return null;
    }

    if (rootRef.current) {
      console.log("Chart root already exists, skipping creation");
      return chartInstanceRef.current;
    }

    try {
      console.log("Creating chart in DOM element:", chartRef.current);
      console.log("Chart container dimensions:", {
        offsetWidth: chartRef.current.offsetWidth,
        offsetHeight: chartRef.current.offsetHeight,
        clientWidth: chartRef.current.clientWidth,
        clientHeight: chartRef.current.clientHeight,
      });

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
      console.log("Chart instance created and stored in ref");

      // Configure nodes
      const nodeTemplate = chart.nodes.template;

      // Make nodes interactive
      nodeTemplate.set("cursorOverStyle", "pointer");
      nodeTemplate.set("tooltipText", "{name}");

      // Create a label for the node - use 'as any' to bypass TypeScript errors
      const anyTemplate = nodeTemplate as any;
      if (!anyTemplate.get("label")) {
        anyTemplate.set("label", am5.Label.new(root, {}));
      }

      // Configure the label
      const label = anyTemplate.get("label");
      if (label) {
        label.setAll({
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
      }

      // Node colors based on level
      anyTemplate.adapters.add("fill", (fill: any, target: any) => {
        try {
          const dataItem = target.dataItem;
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

      // Add hover state - using 'as any' to bypass TypeScript errors
      anyTemplate.states.create("hover", {
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

      // Update the state to reflect successful chart creation
      setChartCreated(true);
      console.log("Chart creation completed successfully");

      // Return chart instance
      return chart;
    } catch (err) {
      console.error("Error creating chart:", err);
      setError("Failed to create chart. Please try refreshing the page.");
      return null;
    }
  }, [handleNodeClick]);

  // Update chart data function
  const updateChartData = useCallback((data: GraphNode) => {
    try {
      console.log("updateChartData called with data:", data);

      if (!rootRef.current) {
        console.error("Cannot update chart data - root reference is null");
        // Instead of simply returning, we should create the chart first
        // We'll handle this in the document ID effect
        return;
      }

      const chart = chartInstanceRef.current;
      if (!chart) {
        console.error("Cannot update chart data - chart instance is null");
        return;
      }

      // Wrap in try-catch to prevent errors if the component is unmounting
      try {
        console.log("Setting chart data:", data);
        chart.data.setAll([data]);
        chart.appear(1000, 100);
        console.log("Chart data updated successfully");
      } catch (chartError) {
        console.error("Error updating chart data in amCharts:", chartError);
      }
    } catch (err) {
      console.error("Error in updateChartData:", err);
    }
  }, []);

  // Transform API data to graph format - using useCallback for stability
  const transformDocumentStructure = useCallback(
    (data: DocumentStructureData): GraphNode => {
      try {
        console.log("Transforming document structure:", data);

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

        // Modified logic to handle the specialized API response format
        // Process each heading and create a node for it
        data.headings.forEach((heading) => {
          if (typeof heading !== "string") {
            console.warn(`Invalid heading type: ${typeof heading}`, heading);
            return; // Skip this heading
          }

          const headingNode: GraphNode = {
            name: heading,
            value: 0.9,
            children: [],
          };

          // Check if this heading has children in the hierarchy
          if (
            data.hierarchy[heading] &&
            Array.isArray(data.hierarchy[heading])
          ) {
            // Add child nodes for each subheading
            data.hierarchy[heading].forEach((subheading) => {
              headingNode.children?.push({
                name: subheading,
                value: 0.6,
                children: [], // Ensure children array exists even if empty
              });
            });
          }

          // If no children were added, check if this is a numbered heading
          // that might have a parent-child relationship with other headings
          if (!headingNode.children?.length && /^\d+(\.\d+)*/.test(heading)) {
            // This is a numbered heading, add an empty child to ensure it's displayed correctly
            headingNode.children?.push({
              name: heading + " content",
              value: 0.4,
            });
          }

          // Add the heading node to the root
          rootNode.children?.push(headingNode);
        });

        console.log(
          "Transformed document structure to graph format:",
          rootNode
        );
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
        }, 20000); // Increase timeout to 20 seconds to give more time

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
            // Add a cache-busting parameter to prevent caching
            cache: "no-store",
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

          // Get the response text regardless of status
          const responseText = await response.text();
          console.log("Raw response:", responseText.substring(0, 200) + "...");

          // Try to parse the response even if it's a 500 error
          // Since we're seeing the API return data even with 500 status
          let data;
          try {
            data = JSON.parse(responseText);
            console.log("Successfully parsed response data:", data);

            // If we could parse it and it has the expected format, use it
            if (
              data &&
              data.headings &&
              Array.isArray(data.headings) &&
              data.hierarchy
            ) {
              return data;
            }
          } catch (parseError) {
            console.error("Failed to parse response as JSON:", parseError);
          }

          // If we reach here, either the response wasn't parseable or didn't have the right format
          if (!response.ok) {
            console.error(
              `Response not OK: ${response.status} ${response.statusText}`
            );

            // Use sample data instead of failing completely
            console.log("Using sample data due to error response");
            return getSampleData;
          }

          return getSampleData;
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
    console.log("Disposing chart...");

    // Clear any pending timeouts
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Dispose of the chart properly
    if (rootRef.current) {
      try {
        console.log("Chart root exists, proceeding with disposal...");

        // First clear any data to prevent pending operations
        if (chartInstanceRef.current) {
          console.log("Clearing chart data before disposal");
          chartInstanceRef.current.data.setAll([]);
        }

        // Delay slightly to ensure pending operations complete
        setTimeout(() => {
          try {
            if (rootRef.current) {
              console.log("Disposing chart root");
              rootRef.current.dispose();
              rootRef.current = null;
              chartInstanceRef.current = null;
              setChartCreated(false);
              console.log("Chart disposed successfully");
            }
          } catch (err) {
            console.error("Error during delayed chart disposal:", err);
          }
        }, 10);
      } catch (err) {
        console.error("Error disposing chart:", err);
      }
    } else {
      console.log("No chart root to dispose");
    }
  }, []);

  // Improved approach to avoid the DOM element not available issue
  useIsomorphicLayoutEffect(() => {
    if (chartRef.current && documentId) {
      console.log("Chart container DOM element is ready:", chartRef.current);

      // Immediately set explicit dimensions on the chart container
      chartRef.current.style.width = "100%";
      chartRef.current.style.height = "100%";
      chartRef.current.style.minHeight = "500px"; // Increased from 300px for better visibility

      // Force a reflow to ensure the browser applies these styles
      void chartRef.current.offsetHeight;

      // Mark container as ready
      containerReadyRef.current = true;

      console.log(
        "Set explicit dimensions on chart container in useLayoutEffect:",
        {
          width: chartRef.current.style.width,
          height: chartRef.current.style.height,
          offsetWidth: chartRef.current.offsetWidth,
          offsetHeight: chartRef.current.offsetHeight,
        }
      );
    }
  }, [documentId]);

  // Fixed fetchAndRender function to handle DOM availability
  const fetchAndRender = useCallback(
    async (docId: string) => {
      if (!docId) return;

      try {
        // First, fetch the document structure
        console.log("Fetching document structure data");
        const data = await fetchDocumentStructure(docId);

        if (!isMounted()) {
          console.log("Component unmounted during fetch, aborting render");
          return;
        }

        // Store the fetched data for later use
        dataRef.current = data;
        console.log("Document structure data fetched successfully");

        // Wait for the container to be available
        let waitAttempts = 0;
        const maxWaitAttempts = 10;

        while (!containerReadyRef.current && waitAttempts < maxWaitAttempts) {
          waitAttempts++;
          console.log(
            `Waiting for chart container to be ready, attempt ${waitAttempts}/${maxWaitAttempts}`
          );
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!isMounted()) {
            console.log(
              "Component unmounted while waiting for container, aborting"
            );
            return;
          }
        }

        // Check if the container is ready
        if (!chartRef.current) {
          console.error(
            "Chart container DOM element not available after waiting"
          );
          setError("Failed to initialize chart - container not found");
          setLoading(false);
          return;
        }

        // Make sure previous chart is fully disposed
        disposeChart();

        // Wait for disposal to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Force a specific size on the container to help with initialization
        if (chartRef.current) {
          chartRef.current.style.width = "100%";
          chartRef.current.style.height = "100%";
          chartRef.current.style.minHeight = "500px"; // Increased from 400px for better visibility
          console.log("Set explicit dimensions on chart container");
        }

        // Create the chart
        console.log("Creating chart after data fetch");

        // Try creating chart with a few retries
        let chart = null;
        let attempts = 0;
        const maxAttempts = 5;

        while (!chart && attempts < maxAttempts && isMounted()) {
          attempts++;
          console.log(`Chart creation attempt ${attempts}/${maxAttempts}`);

          // Wait between attempts with increasing delays
          await new Promise((resolve) => setTimeout(resolve, 300 * attempts));

          if (!chartRef.current) {
            console.error(
              `Chart container disappeared during attempt ${attempts}`
            );
            continue;
          }

          // Try to create the chart
          chart = createChart();

          if (chart) {
            console.log("Chart created successfully on attempt", attempts);
            break;
          } else {
            console.log("Chart creation failed on attempt", attempts);
          }
        }

        if (!chart) {
          console.error(
            "Failed to create chart after",
            maxAttempts,
            "attempts"
          );
          setError(
            "Unable to create chart visualization. Please try refreshing the page."
          );
          setLoading(false);
          return;
        }

        // Transform data for graph
        const graphData = transformDocumentStructure(data);

        // Wait a bit to ensure chart is fully initialized
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Update the chart with the data
        console.log("Updating chart with data");
        updateChartData(graphData);

        // Reset loading and error state
        setLoading(false);
        setError(null);
      } catch (err) {
        if (!isMounted()) return;

        console.error("Error in fetchAndRender:", err);
        setError("Failed to load document structure. Please try again.");
        setLoading(false);
      }
    },
    [
      createChart,
      disposeChart,
      fetchDocumentStructure,
      isMounted,
      transformDocumentStructure,
      updateChartData,
    ]
  );

  // Modified document ID effect to use the improved fetchAndRender
  useEffect(() => {
    // Only load if we have a valid documentId
    if (!documentId) {
      console.log("No document ID, skipping document structure fetch");
      setLoading(false);
      setError(null);
      return;
    }

    // Dispose of any existing chart before creating a new one
    disposeChart();

    // Set loading state
    setLoading(true);
    setError(null);

    console.log(
      `Starting document structure fetch for document ID: ${documentId}`
    );

    // Start the fetch and render process
    fetchAndRender(documentId);

    // Cleanup function
    return () => {
      console.log(`Cleaning up document structure effect for: ${documentId}`);
      // Cleanup handled by isMounted
    };
  }, [documentId, disposeChart, fetchAndRender]);

  // Add a debugging component to display chart status at the top of the graph container
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== "production") {
      return (
        <div
          className={styles.debugInfo}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "4px 8px",
            fontSize: "10px",
            zIndex: 100,
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            borderBottomLeftRadius: "4px",
          }}
        >
          DocumentID: {documentId ? documentId.substring(0, 8) + "..." : "none"}
          <br />
          Chart created: {chartCreated ? "✅" : "❌"}
          <br />
          Data loaded: {dataRef.current ? "✅" : "❌"}
          <br />
          Loading: {loading ? "✅" : "❌"}
        </div>
      );
    }
    return null;
  };

  // Update graphContent to ensure the chart container is always rendered
  const graphContent = () => {
    if (!documentId) {
      console.log("No document ID provided, rendering placeholder");
      return (
        <div className={styles.messageContainer}>
          <p>Select a document to view its structure</p>
        </div>
      );
    }

    // Always render the chart container div, even during loading/error
    // This ensures the DOM element is available for chart creation
    const chartContainerElement = (
      <div className={`${styles.chartContainerWrapper}`}>
        <div
          key={`chart-container-${documentId}`}
          ref={chartRef}
          className={styles.graph}
          style={{
            background: "#f9f9f9",
            border: "1px solid #eee",
            borderRadius: "8px",
          }}
          data-document-id={documentId}
          data-component="amcharts-container"
        />
        <div
          className={styles.chartInfo}
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            padding: "5px",
            borderRadius: "4px",
            fontSize: "10px",
          }}
        >
          Document ID:{" "}
          {documentId ? documentId.substring(0, 8) + "..." : "none"}
        </div>
      </div>
    );

    // Overlay loading or error state on top of the chart container
    if (loading) {
      console.log("Rendering loading state for document structure graph");
      return (
        <>
          {chartContainerElement}
          <div
            className={styles.loadingContainer}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            }}
          >
            <div className={styles.loadingSpinner}></div>
            <p>Loading document structure...</p>
          </div>
        </>
      );
    }

    if (error) {
      console.log("Rendering error state for document structure graph:", error);
      return (
        <>
          {chartContainerElement}
          <div
            className={styles.errorContainer}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            }}
          >
            <p className={styles.errorTitle}>Document Structure Unavailable</p>
            <p className={styles.errorMessage}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => {
                if (documentId) {
                  console.log(
                    "Retrying document structure fetch for:",
                    documentId
                  );
                  setLoading(true);
                  setError(null);
                  setRetryCount(0);
                  disposeChart();
                  fetchAndRender(documentId);
                }
              }}
            >
              Retry
            </button>
          </div>
        </>
      );
    }

    console.log("Rendering chart container div for document:", documentId);
    return chartContainerElement;
  };

  // Main render with error boundary
  return (
    <div className={styles.graphWrapper}>
      {renderDebugInfo()}
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
