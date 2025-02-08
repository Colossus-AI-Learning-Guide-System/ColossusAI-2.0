import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatColumnProps {
  onSend: () => void
}

export function ChatColumn({ onSend }: ChatColumnProps) {
  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Chat messages will be rendered here */}
          <div className="rounded-lg bg-muted/50 p-4">Welcome! How can I help you today?</div>
        </div>
      </div>
      <div className="border-t border-border p-4">
        <div className="relative">
          <Textarea placeholder="Type your message here..." className="min-h-[80px] resize-none pr-12" />
          <Button size="icon" onClick={onSend} className="absolute bottom-2 right-2">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

