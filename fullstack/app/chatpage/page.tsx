'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { PaperclipIcon, SendIcon, ZoomIn, ZoomOut, RotateCw, Download, Maximize, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Sidebar } from '@/app/components/ui/sidebar';
import Image from 'next/image';

// Define the interface for the graph ref
interface GraphRef {
  zoomIn: () => void;
  zoomOut: () => void;
  fitAll: () => void;
}

// Import ForceDirectedGraph with dynamic import to avoid SSR issues
const ForceDirectedGraph = dynamic(() => import('./components/ForceDirectedGraph'), {
  ssr: false
});

// Sample document pages for demonstration
const sampleDocumentPages = [
  '/sample-pdf-page-1.png',
  '/sample-pdf-page-2.png',
  '/sample-pdf-page-3.png',
];

export default function DocumentAnalysisPage() {
  // Reference to the graph component
  const graphRef = useRef<GraphRef>(null);

  // State for chat messages
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I can help you analyze your documents. Upload a file or ask me a question.' }
  ]);
  
  // State for user input
  const [userInput, setUserInput] = useState('');
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State for document viewer
  const [currentPage, setCurrentPage] = useState(0);
  const [documentPages, setDocumentPages] = useState(sampleDocumentPages);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && !selectedFile) return;
    
    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: userInput }];
    setMessages(newMessages);
    
    // Handle file if present
    if (selectedFile) {
      newMessages.push({ 
        role: 'user' as const, 
        content: `Uploaded file: ${selectedFile.name}` 
      });
      setSelectedFile(null);
    }
    
    // Add assistant response (in a real app, this would come from an API)
    setTimeout(() => {
      setMessages([...newMessages, { 
        role: 'assistant' as const, 
        content: 'I received your message. How can I help you analyze this document?' 
      }]);
    }, 1000);
    
    setUserInput('');
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Zoom control handlers
  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoomOut();
    }
  };

  const handleFitAll = () => {
    if (graphRef.current) {
      graphRef.current.fitAll();
    }
  };

  // Document viewer handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < documentPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDocumentZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleDocumentZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    // In a real app, this would download the current document
    const link = document.createElement('a');
    link.href = documentPages[currentPage];
    link.download = `document-page-${currentPage + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handle document selection from graph
  const handleDocumentSelection = (documentId: string) => {
    // In a real app, this would fetch document data from the backend
    setSelectedDocument(documentId);
    // Reset viewer state
    setCurrentPage(0);
    setZoomLevel(1);
    setRotation(0);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Simulate receiving document data when a graph node is clicked
  // In a real app, this would be triggered by an actual click on the graph
  useEffect(() => {
    // Mock function to simulate graph node click
    const mockGraphNodeClick = (nodeId: string) => {
      console.log(`Graph node clicked: ${nodeId}`);
      // This would typically fetch document data from the backend
      handleDocumentSelection(nodeId);
    };

    // For demonstration purposes only
    const simulateClick = () => {
      // This is just for demonstration - remove in real implementation
      // mockGraphNodeClick('financial-report-2023');
    };

    simulateClick();
  }, []);

  return (
    <main className="chatpage-container" style={{ width: '100%' }}>
      <Sidebar />
      <div className="content-wrapper" style={{ marginLeft: '3.05rem', width: 'calc(100% - 3.05rem)', transition: 'margin-left 0.2s ease' }}>
        <div className={styles['papers-container']}>
          {/* Chatbot Conversation Container */}
          <div className={styles.panel + ' ' + styles['chatbot-panel']}>
            <div className={styles['panel-header']}>
              <h2>AI Document Assistant</h2>
            </div>
            <div className={styles['chat-container']}>
              <div className={styles['messages-list']}>
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`${styles['message']} ${styles[message.role]}`}
                  >
                    <div className={styles['message-content']}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles['chat-input-container']}>
                <form onSubmit={handleSendMessage} className={styles['chat-form']}>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about your documents..."
                    className={styles['chat-input']}
                  />
                  <div className={styles['file-upload']}>
                    <label 
                      htmlFor="file-upload" 
                      className={`${styles['file-upload-label']} ${selectedFile ? styles['file-selected'] : ''}`} 
                      title={selectedFile ? selectedFile.name : 'Attach file'}
                    >
                      <PaperclipIcon size={16} />
                      <span className={styles['sr-only']}>Attach file</span>
                    </label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      onChange={handleFileChange} 
                      className={styles['file-input']} 
                    />
                  </div>
                  <button type="submit" className={styles['send-button']} title="Send message">
                    <SendIcon size={16} />
                    <span className={styles['sr-only']}>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Graph Visualization Panel */}
          <div className={styles.panel + ' ' + styles['graph-panel']}>
            <div className={styles['panel-header']}>
              <h2>Document Connections</h2>
              <div className={styles['graph-controls']}>
                <div className={styles['view-toggles']}>
                  <button className={styles['view-toggle'] + ' ' + styles.active}>Network</button>
                  <button className={styles['view-toggle']}>Timeline</button>
                </div>
                <div className={styles['label-toggles']}>
                  <button className={styles['label-toggle']}>Categories</button>
                  <button className={styles['label-toggle']}>Keywords</button>
                </div>
              </div>
            </div>
            <div className={styles['graph-container']}>
              <ForceDirectedGraph ref={graphRef} />
            </div>
            <div className={styles['graph-zoom-controls']}>
              <button className={styles['zoom-btn']} onClick={handleZoomOut}>Zoom Out</button>
              <button className={styles['zoom-btn']} onClick={handleFitAll}>Fit All</button>
              <button className={styles['zoom-btn']} onClick={handleZoomIn}>Zoom In</button>
            </div>
          </div>

          {/* Modern Document Viewer Panel */}
          <div className={styles.panel + ' ' + styles['document-viewer-panel']} ref={viewerRef}>
            <div className={styles['panel-header']}>
              <h2>Document Viewer</h2>
              <div className={styles['document-controls']}>
                <button 
                  className={styles['document-control-btn']} 
                  onClick={handleDocumentZoomOut}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className={styles['zoom-level']}>{Math.round(zoomLevel * 100)}%</span>
                <button 
                  className={styles['document-control-btn']} 
                  onClick={handleDocumentZoomIn}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button 
                  className={styles['document-control-btn']} 
                  onClick={handleRotate}
                  title="Rotate"
                >
                  <RotateCw size={16} />
                </button>
                <button 
                  className={styles['document-control-btn']} 
                  onClick={handleDownload}
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button 
                  className={styles['document-control-btn']} 
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>
            
            <div className={styles['document-viewer-container']}>
              {/* Document display area */}
              <div 
                className={styles['document-display']}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              >
                {documentPages.length > 0 ? (
                  <div className={styles['document-image-container']}>
                    <Image
                      src={documentPages[currentPage]}
                      alt={`Document page ${currentPage + 1}`}
                      width={800}
                      height={1100}
                      className={styles['document-image']}
                      priority
                    />
                    
                    {/* Overlay for annotations or highlights could go here */}
                    <div className={styles['document-overlay']}></div>
                  </div>
                ) : (
                  <div className={styles['document-placeholder']}>
                    <p>Select a document from the graph or upload a file to view</p>
                  </div>
                )}
              </div>
              
              {/* Page navigation */}
              <div className={styles['page-navigation']}>
                <button 
                  className={styles['page-nav-btn']} 
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  title="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className={styles['page-indicator']}>
                  Page {currentPage + 1} of {documentPages.length}
                </div>
                <button 
                  className={styles['page-nav-btn']} 
                  onClick={handleNextPage}
                  disabled={currentPage === documentPages.length - 1}
                  title="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              {/* Thumbnail navigation */}
              <div className={styles['thumbnail-navigation']}>
                {documentPages.map((page, index) => (
                  <div 
                    key={index}
                    className={`${styles['thumbnail']} ${currentPage === index ? styles['active'] : ''}`}
                    onClick={() => setCurrentPage(index)}
                  >
                    <Image
                      src={page}
                      alt={`Thumbnail ${index + 1}`}
                      width={60}
                      height={80}
                      className={styles['thumbnail-image']}
                    />
                    <span className={styles['thumbnail-number']}>{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 