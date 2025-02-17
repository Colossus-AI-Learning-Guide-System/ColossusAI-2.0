import styles from "./content.module.css"

export default function Content() {
  return (
    <div className={styles.content}>
      <h2>Content Details</h2>
      <div className={styles.contentBody}>
        <p>Select a topic from the roadmap to view its content.</p>
      </div>
    </div>
  )
}

