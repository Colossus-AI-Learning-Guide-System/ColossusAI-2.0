'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

// Define the structure of node data
interface NodeData {
  name: string;
  value: number;
  id?: string;
  documentId?: string;
  page?: number;
  children?: NodeData[];
}

// Define the props interface
interface ForceDirectedGraphProps {
  onNodeClick?: (nodeId: string, documentId: string, page: number) => void;
  data?: NodeData;
}

// Define the methods that can be called on the component
interface GraphRef {
  zoomIn: () => void;
  zoomOut: () => void;
  fitAll: () => void;
  updateData: (data: NodeData) => void;
}

// Sample data structure for initial rendering
const initialData: NodeData = {
  name: "Root",
  value: 0,
  children: [
    {
      name: "Document 1",
      value: 1,
      id: "doc1",
      documentId: "doc1",
      page: 0,
      children: [
        {
          name: "Section 1.1",
          value: 1,
          id: "sec1.1",
          documentId: "doc1",
          page: 0
        },
        {
          name: "Section 1.2",
          value: 1,
          id: "sec1.2",
          documentId: "doc1",
          page: 1
        }
      ]
    },
    {
      name: "Document 2",
      value: 1,
      id: "doc2",
      documentId: "doc2",
      page: 0,
      children: [
        {
          name: "Section 2.1",
          value: 1,
          id: "sec2.1",
          documentId: "doc2",
          page: 0
        }
      ]
    }
  ]
};

// ForceDirectedGraph component with ref forwarding
const ForceDirectedGraph = forwardRef<GraphRef, ForceDirectedGraphProps>((props, ref) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<am5hierarchy.ForceDirected | null>(null);
  const rootRef = useRef<am5.Root | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (seriesRef.current) {
        (seriesRef.current as any).zoomIn();
      }
    },
    zoomOut: () => {
      if (seriesRef.current) {
        (seriesRef.current as any).zoomOut();
      }
    },
    fitAll: () => {
      if (seriesRef.current) {
        (seriesRef.current as any).zoomToFit();
      }
    },
    updateData: (data: NodeData) => {
      if (seriesRef.current) {
        seriesRef.current.data.setAll([data]);
      }
    }
  }));

  useEffect(() => {
    // Initialize chart
    if (!chartRef.current) return;

    // Create root element
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create series
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout
      })
    );

    const series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        downDepth: 1,
        initialDepth: 1,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        idField: "id",
        linkWithField: "linkWith",
        manyBodyStrength: -15,
        centerStrength: 0.5
      })
    );

    // Configure nodes
    const nodeTemplate = series.nodes.template;
    
    // Use type assertion to bypass TypeScript errors for amCharts properties
    (nodeTemplate as any).setAll({
      draggable: true,
      tooltipText: "{name}",
      fillOpacity: 0.8,
      strokeWidth: 2,
      stroke: am5.color(0xffffff)
    });

    // Configure circles
    (nodeTemplate as any).circle?.setAll({
      strokeOpacity: 0.8
    });

    // Configure labels
    (nodeTemplate as any).label?.setAll({
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
        fillOpacity: 0.7
      })
    });

    // Handle node click events
    nodeTemplate.events.on("click", (ev) => {
      if (props.onNodeClick) {
        const node = ev.target.dataItem?.dataContext as NodeData;
        if (node && node.id && node.documentId && typeof node.page === 'number') {
          props.onNodeClick(node.id, node.documentId, node.page);
        }
      }
    });

    // Set initial data
    if (props.data) {
      series.data.setAll([props.data]);
    }

    // Save series reference
    seriesRef.current = series;

    // Make stuff animate on load
    series.appear(1000, 100);

    return () => {
      // Clean up
      if (rootRef.current) {
        rootRef.current.dispose();
      }
    };
  }, [props.onNodeClick]);

  // Update data when props.data changes
  useEffect(() => {
    if (seriesRef.current && props.data) {
      seriesRef.current.data.setAll([props.data]);
    }
  }, [props.data]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
});

ForceDirectedGraph.displayName = 'ForceDirectedGraph';

export default ForceDirectedGraph; 