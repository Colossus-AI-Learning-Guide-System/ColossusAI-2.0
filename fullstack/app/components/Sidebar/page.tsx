import styles from "./sidebar.module.css"

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>Colossus.Ai</div>

      <div className={styles.section}>
        <h2>Recent</h2>
        <div className={styles.recentContent}>{/* Add recent items here */}</div>
      </div>

      <div className={styles.section}>
        <h2>Documents</h2>
        <button className={styles.addButton}>+ Add document</button>
      </div>
    </div>
  )
}

