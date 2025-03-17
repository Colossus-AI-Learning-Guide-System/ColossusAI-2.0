'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { PaperclipIcon, SendIcon } from 'lucide-react';
import { Sidebar } from '@/app/components/ui/sidebar';

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

// Sample PDF pages for demonstration
const samplePdfPages = [
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

  // State for PDF viewer
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfPages, setPdfPages] = useState(samplePdfPages);

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

  // PDF navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pdfPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

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

          {/* PDF Viewer Panel */}
          <div className={styles.panel + ' ' + styles['pdf-viewer-panel']}>
            <div className={styles['panel-header']}>
              <h2>Document Viewer</h2>
            </div>
            <div className={styles['pdf-container']}>
              <div className={styles['pdf-page']}>
                {/* In a real application, you would load actual PDF images from your backend */}
                {/* For now, we'll use a placeholder */}
                <div style={{ 
                  width: '100%', 
                  height: '700px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div>
                    <p>Document Page {currentPage + 1} of {pdfPages.length}</p>
                    <p style={{ marginTop: '10px' }}>
                      In the actual application, this area will display images of document pages
                      sent from the backend.
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles['pdf-controls']}>
                <div className={styles['page-indicator']}>
                  Page {currentPage + 1} of {pdfPages.length}
                </div>
                <div className={styles['page-nav']}>
                  <button 
                    className={styles['page-btn']} 
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>
                  <button 
                    className={styles['page-btn']} 
                    onClick={handleNextPage}
                    disabled={currentPage === pdfPages.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 