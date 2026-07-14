import { ReactNode } from 'react';

interface PaperSheetProps {
  children: ReactNode;
}

export default function PaperSheet({ children }: PaperSheetProps) {
  return (
    <article
      className="paper-sheet mx-auto bg-white text-slate-900 shadow-2xl print:shadow-none"
      style={{
        maxWidth: '210mm',
        minHeight: '297mm',
        padding: '25mm 22mm',
        fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
        fontSize: '13.5pt',
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}
    >
      {children}
    </article>
  );
}
