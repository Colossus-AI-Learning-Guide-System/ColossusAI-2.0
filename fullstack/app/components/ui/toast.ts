// Simple toast utility function
export function showToast(title: string, description?: string, variant?: "default" | "destructive") {
    // This is a placeholder implementation
    // In a real app, you would use a toast library or custom implementation
    console.log(`[Toast - ${variant || "default"}] ${title}${description ? ": " + description : ""}`)
  
    // Create a temporary toast element
    const toast = document.createElement("div")
    toast.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
      variant === "destructive" ? "bg-red-600" : "bg-green-600"
    } text-white max-w-md transition-all duration-300 transform translate-y-2 opacity-0`
  
    const titleEl = document.createElement("h3")
    titleEl.className = "font-bold"
    titleEl.textContent = title
    toast.appendChild(titleEl)
  
    if (description) {
      const descEl = document.createElement("p")
      descEl.className = "text-sm mt-1"
      descEl.textContent = description
      toast.appendChild(descEl)
    }
  
    document.body.appendChild(toast)
  
    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0")
    }, 10)
  
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0")
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }
  
  