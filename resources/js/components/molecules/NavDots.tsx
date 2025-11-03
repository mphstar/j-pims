interface NavDotsProps {
  count: number;
  active: number;
  onJump: (i: number) => void;
  sections?: Array<{ id: string; navLabel?: string; title: string }>;
}

export function NavDots({ count, active, onJump, sections }: NavDotsProps) {
  // If sections are provided, use them for stable keys and labels
  if (sections && sections.length > 0) {
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
        {sections.map((section, i) => {
          const label = section.navLabel || section.title.split(' ')[0];
          return (
            <button
              key={section.id}
              aria-label={`Go to ${label}`}
              onClick={() => onJump(i)}
              className={`group relative h-3 w-3 rounded-full transition-all ${
                i === active ? "scale-125 bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
            >
              {/* Tooltip on hover */}
              <span className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Fallback to index-based rendering
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to section ${i + 1}`}
          onClick={() => onJump(i)}
          className={`h-3 w-3 rounded-full transition-all ${
            i === active ? "scale-125 bg-white" : "bg-white/40 hover:bg-white/70"
          }`}
        />
      ))}
    </div>
  );
}
