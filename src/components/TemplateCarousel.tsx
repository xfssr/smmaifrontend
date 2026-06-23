import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TemplateCarouselProps {
  children: React.ReactNode;
  ariaLabel: string;
}

const TemplateCarousel: React.FC<TemplateCarouselProps> = ({ children, ariaLabel }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (direction: 'left' | 'right') => {
    const node = scrollerRef.current;
    if (!node) return;
    const delta = Math.max(260, node.clientWidth * 0.72);
    node.scrollBy({ left: direction === 'right' ? delta : -delta, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory gap-2.5 sm:gap-3.5 overflow-x-auto pb-4 pr-6 scrollbar-hide"
      >
        {children}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 md:flex">
        <button
          type="button"
          onClick={() => scrollByCard('left')}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/85 backdrop-blur-xl transition-all hover:border-orange/40 hover:text-orange hover:shadow-[0_0_15px_rgba(216,138,61,0.2)]"
          aria-label="Scroll templates left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard('right')}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/85 backdrop-blur-xl transition-all hover:border-orange/40 hover:text-orange hover:shadow-[0_0_15px_rgba(216,138,61,0.2)]"
          aria-label="Scroll templates right"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TemplateCarousel;
