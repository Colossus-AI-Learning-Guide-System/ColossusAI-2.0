"use client"

import { useState } from "react"
import ReactFlow, { 
  Node, 
  Edge,
  Background,
  Controls 
} from 'reactflow'
import 'reactflow/dist/style.css'
import styles from "./page.module.css"
import Sidebar from "./components/Sidebar/page"
import Roadmap from "./components/Roadmap/page"
import Content from "./components/Content/page"

type NodeContent = {
  title: string;
  content: string;
}

const nodeContents: { [key: string]: NodeContent } = {
  '1': {
    title: 'Basics of UI/UX Design',
    content: 'UI/UX Design is about enhancing user satisfaction by improving usability, accessibility, and interaction between users and digital products. It consists of User Interface (UI) Design, which focuses on visual aspects, and User Experience (UX) Design, which deals with user journey and interaction.'
  },
  '2': {
    title: 'Elements of Design',
    content: `These are the fundamental building blocks used to create a design. The key elements include:

Line – Defines shapes and forms.
Shape – Geometric (squares, circles) and organic (freeform) shapes.
Color – Used to create contrast, mood, and visual hierarchy.
Texture – Simulates how a surface would feel.
Space – Empty areas that enhance focus and readability.
Typography – Choice of fonts and text formatting.`
  },
  '3': {
    title: 'Principles of Design',
    content: `These are the guidelines for combining design elements effectively. The major principles include:

Balance – Distribution of visual weight (symmetrical or asymmetrical).
Contrast – Differences in color, size, or shape to highlight key areas.
Emphasis – Drawing attention to the most important elements.
Proportion – Size relationships between elements.
Alignment – Proper positioning for a structured design.
Repetition – Reusing elements to create consistency.
Movement – Directing the user's eye through the design.`
  },
  '4': {
    title: 'Gestalt Psychology in Design',
    content: `Gestalt principles explain how humans perceive visual information as whole patterns rather than separate parts. Some key principles:

Similarity – Objects that look alike are grouped together.
Proximity – Objects close to each other are perceived as related.
Closure – The mind fills in missing parts of a design.
Continuity – Elements aligned in a line or curve appear connected.
Figure-Ground – Differentiation between background and foreground.`
  }
}

export default function Dashboard() {
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showError, setShowError] = useState(false)
  const [currentContent, setCurrentContent] = useState<NodeContent | null>(null)

  // Updated nodes with enhanced styling
  const nodes: Node[] = [
    {
      id: '1',
      position: { x: 400, y: 0 },
      data: { label: 'Basics of UI/UX Design' },
      style: { 
        background: '#ffeb3b',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
    // Left side nodes
    {
      id: '2',
      position: { x: 50, y: 100 },
      data: { label: 'Elements of Design' },
      style: { 
        background: '#fff3c4',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
    {
      id: '3',
      position: { x: 50, y: 200 },
      data: { label: 'Principles of Design' },
      style: { 
        background: '#fff3c4',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
    {
      id: '4',
      position: { x: 50, y: 300 },
      data: { label: 'Gestalt Psychology in Design' },
      style: { 
        background: '#fff3c4',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
    // Right side nodes
    {
      id: '5',
      position: { x: 750, y: 100 },
      data: { label: 'Color Theory' },
      style: { 
        background: '#fff3c4',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
    {
      id: '6',
      position: { x: 750, y: 200 },
      data: { label: 'Typography' },
      style: { 
        background: '#fff3c4',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
    {
      id: '7',
      position: { x: 750, y: 300 },
      data: { label: 'Use of Space' },
      style: { 
        background: '#fff3c4',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
    // Bottom section
    {
      id: '8',
      position: { x: 400, y: 400 },
      data: { label: 'Introduction to UI' },
      style: { 
        background: '#ffeb3b',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        width: 200,
      },
    },
  ]

  const edges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true },
    { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', animated: true },
    { id: 'e1-5', source: '1', target: '5', type: 'smoothstep', animated: true },
    { id: 'e1-6', source: '1', target: '6', type: 'smoothstep', animated: true },
    { id: 'e1-7', source: '1', target: '7', type: 'smoothstep', animated: true },
    { id: 'e1-8', source: '1', target: '8', type: 'smoothstep', animated: true },
  ]

  const handleSend = () => {
    if (!inputValue.trim()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000) // Hide error after 3 seconds
      return
    }
    
    setShowError(false)
    setShowRoadmap(true)
  }

  const handleRoadmapClick = () => {
    setShowContent(true)
  }

  const toggleRoadmap = () => {
    setShowRoadmap(!showRoadmap)
  }

  const toggleContent = () => {
    setShowContent(!showContent)
  }

  const onNodeClick = (event: any, node: Node) => {
    const content = nodeContents[node.id]
    if (content) {
      setCurrentContent(content)
      setShowContent(true)
    }
  }

  return (
    <main className={styles.dashboard}>
      <Sidebar 
        onToggleRoadmap={toggleRoadmap} 
        isRoadmapVisible={showRoadmap}
        onToggleContent={toggleContent}
        isContentVisible={showContent}
      />
      <div className={styles.mainContent}>
        {showRoadmap && (
          <div className={styles.roadmapSection}>
            <div style={{ 
              width: '100%', 
              height: '100%',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <ReactFlow 
                nodes={nodes}
                edges={edges}
                fitView
                onNodeClick={onNodeClick}
                style={{ 
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  flex: 1,
                  minHeight: '400px',
                }}
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>
          </div>
        )}
        {showContent && (
          <div className={styles.contentSection}>
            <Content content={currentContent} />
          </div>
        )}
        <div className={styles.chatSection}>
          <div className={styles.chatArea}>
            <div className={styles.welcomeContainer}>
              <div className={styles.welcomeMessage}>
                How can I help you?
              </div>
              <div className={styles.subheading}>
                Colossus.Ai assistant
              </div>
            </div>
            {showError && (
              <div className={styles.errorMessage}>
                Please enter a message before sending
              </div>
            )}
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Type here..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                onClick={handleSend} 
                className={styles.arrowButton} 
                style={{ borderRadius: '50%', padding: '10px', border: 'none' }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

