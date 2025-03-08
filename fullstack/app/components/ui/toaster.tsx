"use client"

import React from 'react';
import * as ToastPrimitives from "@radix-ui/react-toast"
import { useToast } from "./use-toast"

const Toaster: React.FC = () => {
  const { toasts } = useToast()

  return (
    <ToastPrimitives.Provider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <ToastPrimitives.Root key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastPrimitives.Title>{title}</ToastPrimitives.Title>}
            {description && <ToastPrimitives.Description>{description}</ToastPrimitives.Description>}
          </div>
          {action}
          <ToastPrimitives.Close />
        </ToastPrimitives.Root>
      ))}
      <ToastPrimitives.Viewport />
    </ToastPrimitives.Provider>
  )
}

export default Toaster;

