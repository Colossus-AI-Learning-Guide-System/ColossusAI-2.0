'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

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

export default function ResearchPage() {
  // Reference to the graph component
  const graphRef = useRef<GraphRef>(null);

  // State for selected papers
  const [selectedPapers, setSelectedPapers] = useState([
    {
      authors: 'Yang — Wang',
      year: '2011',
      title: 'Scientific Productivity, Research Funding, Race and Ethnicity',
      category: 'arXiv: Applications',
      abstract: 'In a recent study by Ginther et al., the probability of receiving a U.S. National Institutes of Health (NIH) R01 award was related to the applicant\'s race/ethnicity...'
    },
    {
      authors: 'Ginther — Schaffer',
      year: '2016',
      title: 'Gender, Race/Ethnicity, and National Institutes of Health R01 Research Awards: Is There Evidence of a Double Bind?',
      category: 'Academic Medicine',
      abstract: 'The authors examined the association between gender, race/ethnicity, and the probability of receiving a National Institutes of Health R01 award...'
    }
  ]);

  // State for PDF viewer
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfPages, setPdfPages] = useState(samplePdfPages);

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
      <div className={styles['papers-container']}>
        {/* Selected Papers Panel */}
        <div className={styles.panel + ' ' + styles['selected-papers-panel']}>
          <div className={styles['panel-header']}>
            <h2>Selected papers</h2>
            <div className={styles['export-buttons']}>
              <button className={styles['export-btn']}>Export</button>
              <button className={styles['export-btn']}>.bib</button>
              <button className={styles['export-btn']}>.ris</button>
              <button className={styles['export-btn']}>.json</button>
            </div>
          </div>
          <div className={styles['papers-list']}>
            {selectedPapers.map((paper, index) => (
              <div key={index} className={styles['paper-card']}>
                <div className={styles['paper-header']}>
                  <span className={styles.authors}>{paper.authors}</span>
                  <span className={styles.year}>{paper.year}</span>
                </div>
                <h3 className={styles['paper-title']}>{paper.title}</h3>
                <div className={styles['paper-category']}>{paper.category}</div>
                <p className={styles['paper-abstract']}>{paper.abstract}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Graph Visualization Panel */}
        <div className={styles.panel + ' ' + styles['graph-panel']}>
          <div className={styles['panel-header']}>
            <h2>Connections between papers</h2>
            <div className={styles['graph-controls']}>
              <div className={styles['view-toggles']}>
                <button className={styles['view-toggle'] + ' ' + styles.active}>Network</button>
                <button className={styles['view-toggle']}>Timeline</button>
              </div>
              <div className={styles['label-toggles']}>
                <button className={styles['label-toggle']}>First Author</button>
                <button className={styles['label-toggle']}>Last Author</button>
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
            <h2>PDF Viewer</h2>
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
                  <p>PDF Page {currentPage + 1} of {pdfPages.length}</p>
                  <p style={{ marginTop: '10px' }}>
                    In the actual application, this area will display images of PDF pages
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
    </main>
  );
} 