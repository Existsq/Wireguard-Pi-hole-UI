"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { GeistSans } from "geist/font/sans"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className={`${GeistSans.className} py-3`}>
            <div className="grid gap-0.5">
              {title && <ToastTitle className="text-sm">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport 
        className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-[390px] max-w-[100vw] m-0 list-none z-[100] outline-none"
      />
    </ToastProvider>
  )
}
