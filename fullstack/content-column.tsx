export function ContentColumn() {
    return (
      <div className="h-full overflow-auto p-4 transition-all duration-300 ease-in-out">
        <h2 className="text-xl font-semibold mb-4">Content Details</h2>
        <div className="prose prose-invert max-w-none">
          <p>
            This section will contain detailed information about the selected topic. Click on a roadmap item to see its
            content here.
          </p>
        </div>
      </div>
    )
  }
  
  