import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface ValidationMessageProps {
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface ValidationListProps {
  items: string[];
  validItems: string[];
}

export function ValidationMessage({ type, message }: ValidationMessageProps) {
  return (
    <div className="h-0 text-xs">
      {message && (
        <div
          className={cn(
            "flex items-center gap-1",
            type === 'error' && "text-red-500",
            type === 'success' && "text-green-500",
            type === 'warning' && "text-yellow-500"
          )}
        >
          {type === 'error' && <XCircle className="h-3 w-3" />}
          {type === 'success' && <CheckCircle2 className="h-3 w-3" />}
          {type === 'warning' && <AlertCircle className="h-3 w-3" />}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export function ValidationList({ items, validItems }: ValidationListProps) {
  return (
    <div className="min-h-[100px] text-xs space-y-1">
      {items.map((item, index) => {
        const isValid = validItems.includes(item);
        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-1",
              isValid ? "text-green-500" : "text-gray-400"
            )}
          >
            {isValid ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
} 