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

export default function ResearchPage() {
  // Reference to the graph component
  const graphRef = useRef<GraphRef>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [similarPapers, setSimilarPapers] = useState([
    {
      authors: 'Ginther — Kington',
      year: '2012',
      title: 'Are race, ethnicity, and medical school affiliation associated with NIH R01 type 1 award probability',
      category: 'Academic Medicine',
      relevance: '5.0'
    },
    {
      authors: 'Moss-Racusin — Handelsman',
      year: '2012',
      title: 'Science faculty\'s subtle gender biases favor male students',
      category: 'Proceedings of the National Academy of Sciences',
      relevance: '4.7'
    },
    {
      authors: 'Bakken — Wang',
      year: '2006',
      title: 'Viewing Clinical Research Career Development Through the Lens of Social Cognitive Career Theory',
      category: 'Advances in Health Sciences Education',
      relevance: '4.2'
    },
    {
      authors: 'Valantine — Collins',
      year: '2015',
      title: 'National Institutes of Health addresses the science of diversity',
      category: 'Proceedings of the National Academy of Sciences',
      relevance: '4.9'
    },
    {
      authors: 'Carnes — Sheridan',
      year: '2015',
      title: 'The effect of an intervention to break the gender bias habit for faculty at one institution: a cluster randomized, controlled trial',
      category: 'Academic Medicine',
      relevance: '3.4'
    }
  ]);

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

  return (
    <main className="chatpage-container">
      <div className={styles['papers-container']}>
        {/* Selected Papers Panel */}
        <div className={styles.panel + ' ' + styles['selected-papers-panel']}>
          <div className={styles['panel-header']}>
            <h2>5 selected papers</h2>
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

        {/* Similar Work Panel */}
        <div className={styles.panel + ' ' + styles['similar-work-panel']}>
          <div className={styles['panel-header']}>
            <h2>Similar Work</h2>
            <div className={styles['filter-section']}>
              <select className={styles['filter-dropdown']}>
                <option>Relevance</option>
              </select>
            </div>
          </div>
          <div className={styles['papers-list']}>
            {similarPapers.map((paper, index) => (
              <div key={index} className={styles['paper-card']}>
                <div className={styles['relevance-badge']}>{paper.relevance}</div>
                <div className={styles['paper-header']}>
                  <span className={styles.authors}>{paper.authors}</span>
                  <span className={styles.year}>{paper.year}</span>
                </div>
                <h3 className={styles['paper-title']}>{paper.title}</h3>
                <div className={styles['paper-category']}>{paper.category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Graph Visualization Panel */}
        <div className={styles.panel + ' ' + styles['graph-panel']}>
          <div className={styles['panel-header']}>
            <h2>Connections between your collection and 54 papers</h2>
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
      </div>
    </main>
  );
} 