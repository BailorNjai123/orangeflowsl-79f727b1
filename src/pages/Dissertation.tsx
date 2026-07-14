import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Printer, ArrowLeft, BookOpen } from 'lucide-react';
import ChapterThree from '@/components/dissertation/ChapterThree';
import ChapterFour from '@/components/dissertation/ChapterFour';
import { useToast } from '@/hooks/use-toast';

type Chapter = 'three' | 'four';

export default function Dissertation() {
  const [chapter, setChapter] = useState<Chapter>('three');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    const root = containerRef.current;
    if (!root) return;
    // Clone and strip SVG / PRE / CODE / IMG
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('svg, pre, code, img, button, .no-print').forEach((el) => el.remove());
    const text = (clone.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied clean text', description: `${text.length.toLocaleString()} characters copied.` });
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed' });
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      {/* Sticky utility bar */}
      <div className="no-print sticky top-0 z-40 border-b border-slate-300 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <BookOpen className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-slate-800">Dissertation</span>
          </div>

          <div className="flex-1" />

          <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-sm">
            <button
              onClick={() => setChapter('three')}
              className={`px-4 py-1.5 ${chapter === 'three' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
            >
              Chapter Three · Methodology
            </button>
            <button
              onClick={() => setChapter('four')}
              className={`px-4 py-1.5 border-l border-slate-300 ${chapter === 'four' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
            >
              Chapter Four · Implementation
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Copy className="h-4 w-4" /> Copy Clean Text
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-sm text-white hover:bg-orange-600"
          >
            <Printer className="h-4 w-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      <div ref={containerRef} className="py-8 print:py-0">
        {chapter === 'three' ? <ChapterThree /> : <ChapterFour />}
      </div>
    </div>
  );
}
