import styles from "./content.module.css"

interface ContentProps {
  content?: {
    title: string;
    content: string;
  } | null;
}

export default function Content({ content }: ContentProps) {
  if (!content) {
    return (
      <div className={styles.content}>
        <h2>Select a node to view content</h2>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <h2>{content.title}</h2>
      <div className={styles.contentBody}>
        {content.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}

