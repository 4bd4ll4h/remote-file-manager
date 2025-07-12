"use client";

export default function Breadcrumb({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate: (newPath: string) => void;
}) {
  const parts = path === "/" ? [] : path.split("/").filter(Boolean);
  const fullPaths = parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/"));

  return (
    <div className="text-sm text-gray-600 flex flex-wrap gap-1 items-center mb-2">
      <button onClick={() => onNavigate("/")} className="text-blue-500 hover:underline">
        /
      </button>
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        return (
          <span key={fullPaths[i]} className="flex items-center gap-1">
            <span>/</span>
            {isLast ? (
              <span className="font-semibold text-gray-800">{part}</span>
            ) : (
              <button onClick={() => onNavigate(fullPaths[i])} className="text-blue-500 hover:underline">
                {part}
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
