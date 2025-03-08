import styles from "./roadmap.module.css"

interface RoadmapProps {
  onRoadmapClick: () => void
}

export default function Roadmap({ onRoadmapClick }: RoadmapProps) {
  return (
    <div className={styles.roadmap} onClick={onRoadmapClick}>
      <h2>Roadmap</h2>
      <div className={styles.roadmapItems}>
        {/* Empty roadmap items container */}
      </div>
    </div>
  )
}

