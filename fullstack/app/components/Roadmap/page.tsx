import styles from "./roadmap.module.css"

interface RoadmapProps {
  onRoadmapClick: () => void
}

export default function Roadmap({ onRoadmapClick }: RoadmapProps) {
  return (
    <div className={styles.roadmap}>
      <h2>Learning Roadmap</h2>
      <div className={styles.roadmapItems}>
        <button className={styles.roadmapItem} onClick={onRoadmapClick}>
          <h3>Introduction</h3>
          <p>Getting started with the basics</p>
        </button>
        <button className={styles.roadmapItem} onClick={onRoadmapClick}>
          <h3>Core Concepts</h3>
          <p>Understanding fundamental principles</p>
        </button>
      </div>
    </div>
  )
}

