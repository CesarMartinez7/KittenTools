export default function SkeletonJsonKey() {
  return (
    <div className="bg-transparent flex flex-col gap-y-4 ml-6">
      <span>{"{"}</span>
      <div className="bg-zinc-700 rounded animate-pulse h-4 w-16"></div>
      <div className="bg-zinc-700 rounded animate-pulse h-4 w-32"></div>
      <div className="bg-zinc-700 rounded animate-pulse h-4 w-24"></div>
      <div className="bg-zinc-700 rounded animate-pulse h-4 w-28"></div>
      <span>{"},"}</span>
    </div>
  );
}
