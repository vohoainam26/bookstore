import { Spinner } from "@phosphor-icons/react/dist/ssr";

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size={48} className="animate-spin text-red-600" />
    </div>
  );
}
