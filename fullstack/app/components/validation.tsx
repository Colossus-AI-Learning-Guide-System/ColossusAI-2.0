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
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg text-sm",
        type === 'error' && "bg-red-50 text-red-700",
        type === 'success' && "bg-green-50 text-green-700",
        type === 'warning' && "bg-yellow-50 text-yellow-700"
      )}
    >
      {type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
      {type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      {type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
      <span>{message}</span>
    </div>
  );
}

export function ValidationList({ items, validItems }: ValidationListProps) {
  return (
    <div className="mt-2 space-y-1">
      {items.map((item, index) => {
        const isValid = validItems.includes(item);
        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-sm",
              isValid ? "text-green-600" : "text-gray-500"
            )}
          >
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-gray-300" />
            )}
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
} 