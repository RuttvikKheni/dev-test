import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:shadow-xs",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl border border-blue-700 transition-all duration-200",
        destructive:
          "bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 hover:shadow-xl focus-visible:ring-red-300 border border-red-700 transition-all duration-200",
        outline:
          "border-2 border-blue-600 bg-white text-blue-700 font-semibold shadow-lg hover:bg-blue-600 hover:text-white hover:shadow-xl dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-200",
        secondary:
          "bg-gray-600 text-white font-semibold shadow-lg hover:bg-gray-700 hover:shadow-xl border border-gray-700 transition-all duration-200",
        ghost:
          "text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200",
        link: "text-blue-600 font-medium underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
