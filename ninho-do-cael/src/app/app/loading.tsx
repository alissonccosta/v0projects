import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label="Carregando conteúdo"
    >
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32 sm:col-span-2 lg:col-span-1" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
