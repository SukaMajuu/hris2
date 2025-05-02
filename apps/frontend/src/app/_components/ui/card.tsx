// card.tsx
import * as React from "react";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border p-4 shadow-sm bg-white ${className}`}
    {...props}
  />
));
Card.displayName = "Card";
