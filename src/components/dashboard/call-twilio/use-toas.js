"use client"

import * as React from "react"

import { ToastAction } from "@/components/ui/toast"
import { useToast as useToastShadcn } from "@/components/ui/use-toast"

export function useToast() {
  const { toast } = useToastShadcn()

  const showToast = React.useCallback(
    ({ title, description, variant, action }) => {
      toast({
        title,
        description,
        variant,
        action: action ? <ToastAction altText={action.altText}>{action.label}</ToastAction> : undefined,
      })
    },
    [toast],
  )

  return { toast: showToast }
}
