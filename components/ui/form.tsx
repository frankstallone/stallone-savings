import * as React from "react"

import { cn } from "@/lib/utils"

const Form = React.forwardRef<HTMLFormElement, React.ComponentProps<"form">>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      data-slot="form"
      className={cn("space-y-6", className)}
      {...props}
    />
  )
)
Form.displayName = "Form"

export { Form }
