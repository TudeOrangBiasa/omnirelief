import { RefreshIcon } from "@solar-icons/react/linear";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <RefreshIcon className="animate-spin" />
    </div>
  );
}
