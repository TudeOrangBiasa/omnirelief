import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { Spinner } from "@omnirelief/ui/components/spinner";

type PropertiLoader =
  | { label?: string; baris?: never }
  | { label?: string; baris: number };

export default function Loader({ label = "Memuat…", baris }: PropertiLoader) {
  if (typeof baris === "number") {
    return (
      <div role="status" aria-label={label} className="flex flex-col gap-2">
        {Array.from({ length: baris }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-label={label}
      className="flex min-h-12 items-center justify-center gap-2 pt-8"
    >
      <Spinner className="size-6" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
