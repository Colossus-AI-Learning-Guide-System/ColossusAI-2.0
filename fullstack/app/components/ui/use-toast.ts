"use client"

import type React from "react"
import { useEffect, useState, useReducer, useCallback } from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
  variant?: "default" | "destructive"
}

type ToastActionElement = React.ReactElement

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Side effects
      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId))
          toastTimeouts.delete(toastId)
        }
      } else {
        for (const [id, timeout] of toastTimeouts.entries()) {
          clearTimeout(timeout)
          toastTimeouts.delete(id)
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Create a context for toast state
const INITIAL_STATE: State = { toasts: [] }

type Toast = Omit<ToasterToast, "id">

// Shared state for toast across components
const useToastStore = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  
  const toast = useCallback(({ ...props }: Toast) => {
    const id = genId()

    const update = (props: ToasterToast) =>
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      })
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss()
        },
      },
    })

    return {
      id: id,
      dismiss,
      update,
    }
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}

// Singleton pattern for toast state
let store: ReturnType<typeof useToastStore> | undefined

function useToast() {
  const [mounted, setMounted] = useState(false)
  const storeRef = useToastStore()

  // Only use the store on the client
  useEffect(() => {
    if (!store) {
      store = storeRef
    }
    setMounted(true)
  }, [storeRef])

  return mounted ? store! : storeRef
}

export { useToast, type Toast }

