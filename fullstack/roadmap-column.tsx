interface RoadmapColumnProps {
    onClick: () => void
  }
  
  export function RoadmapColumn({ onClick }: RoadmapColumnProps) {
    return (
      <div
        onClick={onClick}
        className="h-full overflow-auto border-r border-border p-4 transition-all duration-300 ease-in-out cursor-pointer hover:bg-muted/50"
      >
        <h2 className="text-xl font-semibold mb-4">Learning Roadmap</h2>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Step 1: Fundamentals</h3>
            <p className="text-sm text-muted-foreground">Start with the basic concepts and foundations.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Step 2: Advanced Topics</h3>
            <p className="text-sm text-muted-foreground">Dive deeper into more complex subjects.</p>
          </div>
        </div>
      </div>
    )
  }
  
  