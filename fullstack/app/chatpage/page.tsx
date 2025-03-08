"use client"

import { useState, useRef } from "react"
import ReactFlow, { 
  Node, 
  Edge,
  Background,
  Controls 
} from 'reactflow'
import 'reactflow/dist/style.css'
import styles from "./page.module.css"
import Sidebar from "./components/Sidebar/Sidebar"
import Content from "./components/Content/Content"

type NodeContent = {
  title: string;
  content: string;
}

interface ResponseData {
  title: string;
  content: string;
}

export default function Dashboard() {
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentContent, setCurrentContent] = useState<NodeContent | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [nodeContents, setNodeContents] = useState<{ [key: string]: NodeContent }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setIsLoading(true)
    
    const fileData: string[] = []
    const fileNames: string[] = []

    // Read all selected files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check if the file is a PDF
      if (!file.type.includes('pdf')) {
        setErrorMessage("Only PDF files are supported")
        setShowError(true)
        setTimeout(() => setShowError(false), 3000)
        setIsLoading(false)
        return
      }
      
      fileNames.push(file.name)
      
      // Convert file to base64
      const reader = new FileReader()
      const base64String = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.readAsDataURL(file)
      })
      
      fileData.push(base64String)
    }
    
    try {
      // Send files to backend
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: fileData })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'File upload failed')
      }
      
      setUploadedFiles(prev => [...prev, ...fileNames])
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files'
      console.error('Error uploading files:', error)
      setErrorMessage(errorMessage)
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim()) {
      setErrorMessage("Please enter a query")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }
    
    if (uploadedFiles.length === 0) {
      setErrorMessage("Please upload at least one document first")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }
    
    setIsLoading(true)
    setShowError(false)
    
    try {
      // Send query to backend
      const response = await fetch('http://localhost:5001/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Query failed')
      }
      
      const data = await response.json()
      
      // Process the response to create nodes and edges
      generateGraphFromResponse(data)
      
      setShowRoadmap(true)
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process query'
      console.error('Error querying:', error)
      setErrorMessage(errorMessage)
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to generate graph from API response
  const generateGraphFromResponse = (responseData: ResponseData[]) => {
    // Create a new nodecontent object
    const newNodeContents: { [key: string]: NodeContent } = {}
    
    // Generate nodes from the response
    const newNodes: Node[] = responseData.map((item, index) => {
      const id = (index + 1).toString()
      
      // Extract title from the item
      let displayTitle = item.title
        .replace(/^\d+\.\s+/, '') // Remove numbering prefix like "1. "
        .trim()
      
      // Limit title length for display
      if (displayTitle.length > 30) {
        displayTitle = displayTitle.substring(0, 27) + "..."
      }
      
      // Store the content for this node
      newNodeContents[id] = {
        title: item.title,
        content: item.content
      }
      
      // Calculate positions (central node at top, others arranged in a circle)
      let x = 400
      let y = 100
      
      if (index > 0) {
        const radius = 300
        const angle = ((index - 1) / (responseData.length - 1)) * Math.PI * 2
        x = 400 + radius * Math.cos(angle)
        y = 250 + radius * Math.sin(angle)
      }
      
      return {
        id,
        position: { x, y },
        data: { label: displayTitle },
        style: { 
          background: index === 0 ? '#ffeb3b' : '#fff3c4',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid black',
          width: 200,
          color: '#000',
        },
      }
    })
    
    // Generate edges connecting the central node (first node) to all others
    const newEdges: Edge[] = []
    
    for (let i = 1; i < newNodes.length; i++) {
      newEdges.push({
        id: `e1-${i+1}`,
        source: '1',
        target: (i+1).toString(),
        type: 'smoothstep',
        animated: true
      })
    }
    
    setNodes(newNodes)
    setEdges(newEdges)
    setNodeContents(newNodeContents)
  }

  const toggleRoadmap = () => {
    setShowRoadmap(!showRoadmap)
  }

  const toggleContent = () => {
    setShowContent(!showContent)
  }

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    const content = nodeContents[node.id]
    if (content) {
      setCurrentContent(content)
      setShowContent(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend()
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
            
            {/* File upload area */}
            <div className={styles.uploadArea}>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf"
                style={{ display: 'none' }}
              />
              <button 
                onClick={triggerFileInput}
                className={styles.uploadButton}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upload PDFs'}
              </button>
              {uploadedFiles.length > 0 && (
                <div className={styles.fileList}>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className={styles.fileName}>
                      {file}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {showError && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}
            
            {isLoading && !showError && (
              <div className={styles.loadingIndicator}>
                Processing your request...
              </div>
            )}
            
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Ask anything about your documents..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                onClick={handleSend} 
                className={styles.arrowButton} 
                style={{ borderRadius: '50%', padding: '10px', border: 'none' }}
                disabled={isLoading}
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





// "use client"

// import { useState } from "react"
// import ReactFlow, { 
//   Node, 
//   Edge,
//   Background,
//   Controls 
// } from 'reactflow'
// import 'reactflow/dist/style.css'
// import styles from "./page.module.css"
// import Sidebar from "./components/Sidebar/page"
// import Roadmap from "./components/Roadmap/page"
// import Content from "./components/Content/page"

// type NodeContent = {
//   title: string;
//   content: string;
// }

// const nodeContents: { [key: string]: NodeContent } = {
//   '1': {
//     title: 'Basics of UI/UX Design',
//     content: 'UI/UX Design is about enhancing user satisfaction by improving usability, accessibility, and interaction between users and digital products. It consists of User Interface (UI) Design, which focuses on visual aspects, and User Experience (UX) Design, which deals with user journey and interaction.'
//   },
//   '2': {
//     title: 'Elements of Design',
//     content: `These are the fundamental building blocks used to create a design. The key elements include:

// Line – Defines shapes and forms.
// Shape – Geometric (squares, circles) and organic (freeform) shapes.
// Color – Used to create contrast, mood, and visual hierarchy.
// Texture – Simulates how a surface would feel.
// Space – Empty areas that enhance focus and readability.
// Typography – Choice of fonts and text formatting.`
//   },
//   '3': {
//     title: 'Principles of Design',
//     content: `These are the guidelines for combining design elements effectively. The major principles include:

// Balance – Distribution of visual weight (symmetrical or asymmetrical).
// Contrast – Differences in color, size, or shape to highlight key areas.
// Emphasis – Drawing attention to the most important elements.
// Proportion – Size relationships between elements.
// Alignment – Proper positioning for a structured design.
// Repetition – Reusing elements to create consistency.
// Movement – Directing the user's eye through the design.`
//   },
//   '4': {
//     title: 'Gestalt Psychology in Design',
//     content: `Gestalt principles explain how humans perceive visual information as whole patterns rather than separate parts. Some key principles:

// Similarity – Objects that look alike are grouped together.
// Proximity – Objects close to each other are perceived as related.
// Closure – The mind fills in missing parts of a design.
// Continuity – Elements aligned in a line or curve appear connected.
// Figure-Ground – Differentiation between background and foreground.`
//   }
// }

// export default function Dashboard() {
//   const [showRoadmap, setShowRoadmap] = useState(false)
//   const [showContent, setShowContent] = useState(false)
//   const [inputValue, setInputValue] = useState("")
//   const [showError, setShowError] = useState(false)
//   const [currentContent, setCurrentContent] = useState<NodeContent | null>(null)

//   // Updated nodes with enhanced styling
//   const nodes: Node[] = [
//     {
//       id: '1',
//       position: { x: 400, y: 0 },
//       data: { label: 'Basics of UI/UX Design' },
//       style: { 
//         background: '#ffeb3b',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//     // Left side nodes
//     {
//       id: '2',
//       position: { x: 50, y: 100 },
//       data: { label: 'Elements of Design' },
//       style: { 
//         background: '#fff3c4',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//     {
//       id: '3',
//       position: { x: 50, y: 200 },
//       data: { label: 'Principles of Design' },
//       style: { 
//         background: '#fff3c4',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//     {
//       id: '4',
//       position: { x: 50, y: 300 },
//       data: { label: 'Gestalt Psychology in Design' },
//       style: { 
//         background: '#fff3c4',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//     // Right side nodes
//     {
//       id: '5',
//       position: { x: 750, y: 100 },
//       data: { label: 'Color Theory' },
//       style: { 
//         background: '#fff3c4',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//     {
//       id: '6',
//       position: { x: 750, y: 200 },
//       data: { label: 'Typography' },
//       style: { 
//         background: '#fff3c4',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//     {
//       id: '7',
//       position: { x: 750, y: 300 },
//       data: { label: 'Use of Space' },
//       style: { 
//         background: '#fff3c4',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//     // Bottom section
//     {
//       id: '8',
//       position: { x: 400, y: 400 },
//       data: { label: 'Introduction to UI' },
//       style: { 
//         background: '#ffeb3b',
//         padding: '10px',
//         borderRadius: '8px',
//         border: '1px solid black',
//         width: 200,
//       },
//     },
//   ]

//   const edges: Edge[] = [
//     { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
//     { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true },
//     { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', animated: true },
//     { id: 'e1-5', source: '1', target: '5', type: 'smoothstep', animated: true },
//     { id: 'e1-6', source: '1', target: '6', type: 'smoothstep', animated: true },
//     { id: 'e1-7', source: '1', target: '7', type: 'smoothstep', animated: true },
//     { id: 'e1-8', source: '1', target: '8', type: 'smoothstep', animated: true },
//   ]

//   const handleSend = () => {
//     if (!inputValue.trim()) {
//       setShowError(true)
//       setTimeout(() => setShowError(false), 3000) // Hide error after 3 seconds
//       return
//     }
    
//     setShowError(false)
//     setShowRoadmap(true)
//   }

//   const handleRoadmapClick = () => {
//     setShowContent(true)
//   }

//   const toggleRoadmap = () => {
//     setShowRoadmap(!showRoadmap)
//   }

//   const toggleContent = () => {
//     setShowContent(!showContent)
//   }

//   const onNodeClick = (event: any, node: Node) => {
//     const content = nodeContents[node.id]
//     if (content) {
//       setCurrentContent(content)
//       setShowContent(true)
//     }
//   }

//   return (
//     <main className={styles.dashboard}>
//       <Sidebar 
//         onToggleRoadmap={toggleRoadmap} 
//         isRoadmapVisible={showRoadmap}
//         onToggleContent={toggleContent}
//         isContentVisible={showContent}
//       />
//       <div className={styles.mainContent}>
//         {showRoadmap && (
//           <div className={styles.roadmapSection}>
//             <div style={{ 
//               width: '100%', 
//               height: '100%',
//               padding: '20px',
//               display: 'flex',
//               flexDirection: 'column'
//             }}>
//               <ReactFlow 
//                 nodes={nodes}
//                 edges={edges}
//                 fitView
//                 onNodeClick={onNodeClick}
//                 style={{ 
//                   background: 'rgba(0, 0, 0, 0.2)',
//                   borderRadius: '8px',
//                   flex: 1,
//                   minHeight: '400px',
//                 }}
//               >
//                 <Background />
//                 <Controls />
//               </ReactFlow>
//             </div>
//           </div>
//         )}
//         {showContent && (
//           <div className={styles.contentSection}>
//             <Content content={currentContent} />
//           </div>
//         )}
//         <div className={styles.chatSection}>
//           <div className={styles.chatArea}>
//             <div className={styles.welcomeContainer}>
//               <div className={styles.welcomeMessage}>
//                 How can I help you?
//               </div>
//               <div className={styles.subheading}>
//                 Colossus.Ai assistant
//               </div>
//             </div>
//             {showError && (
//               <div className={styles.errorMessage}>
//                 Please enter a message before sending
//               </div>
//             )}
//             <div className={styles.chatInput}>
//               <input 
//                 type="text" 
//                 placeholder="Type here..." 
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//               />
//               <button 
//                 onClick={handleSend} 
//                 className={styles.arrowButton} 
//                 style={{ borderRadius: '50%', padding: '10px', border: 'none' }}
//               >
//                 <svg 
//                   xmlns="http://www.w3.org/2000/svg" 
//                   width="24" 
//                   height="24" 
//                   viewBox="0 0 24 24" 
//                   fill="none" 
//                   stroke="currentColor" 
//                   strokeWidth="2" 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round"
//                 >
//                   <line x1="5" y1="12" x2="19" y2="12"></line>
//                   <polyline points="12 5 19 12 12 19"></polyline>
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }

