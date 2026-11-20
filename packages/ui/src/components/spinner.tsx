import * as React from "react";
import { RefreshIcon } from "@solar-icons/react/linear";
import { cn } from "@omnirelief/ui/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <RefreshIcon
      role="status"
      aria-label="Memuat"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
