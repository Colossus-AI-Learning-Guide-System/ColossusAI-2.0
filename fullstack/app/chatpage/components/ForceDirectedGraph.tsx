'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

// Sample data structure matching our papers
const data = {
  name: "Research Papers",
  value: 0,
  children: [
    {
      name: "Yang 2011",
      value: 1,
      children: [
        { name: "Ginther 2012", value: 1 },
        { name: "Bianchini 2013", value: 1 },
        { name: "Erickson 2014", value: 1 }
      ]
    },
    {
      name: "Ginther 2016",
      value: 1,
      children: [
        { name: "Valantine 2015", value: 1 },
        { name: "Carnes 2015", value: 1 },
        { name: "Moss-Racusin 2012", value: 1 }
      ]
    },
    {
      name: "Valantine 2015",
      value: 1,
      children: [
        { name: "Ginther 2018", value: 1 },
        { name: "Selly 2021", value: 1 },
        { name: "Hong 2004", value: 1 }
      ]
    },
    {
      name: "Bakken 2006",
      value: 1,
      children: [
        { name: "Tabak 2017", value: 1 },
        { name: "McGee 2012", value: 1 }
      ]
    },
    {
      name: "Maffei 1996",
      value: 1,
      children: [
        { name: "Hong 2004", value: 1 }
      ]
    }
  ]
};

// Define the component with forwardRef to expose methods to parent
const ForceDirectedGraph = forwardRef((props, ref) => {
  const rootRef = useRef<am5.Root | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      console.log("Zoom in requested");
    },
    zoomOut: () => {
      console.log("Zoom out requested");
    },
    fitAll: () => {
      console.log("Fit all requested");
    }
  }));

  useEffect(() => {
    // Create root element
    const root = am5.Root.new("chartdiv");
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create wrapper container
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout
      })
    );

    // Create series
    const series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        downDepth: 1,
        initialDepth: 2,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        centerStrength: 0.5,
        minRadius: 50,
        maxRadius: 70,
        nodePadding: 25,
        manyBodyStrength: -60
      })
    );

    // Set data
    series.data.setAll([data]);

    // Make stuff animate on load
    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        id="chartdiv"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
    </div>
  );
});

// Add display name for debugging
ForceDirectedGraph.displayName = "ForceDirectedGraph";

export default ForceDirectedGraph; 