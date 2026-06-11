import type { Metadata } from 'next';
import '../src/design/index.css';

export const metadata: Metadata = {
  title: 'StudyMarket — Academic Document Marketplace',
  description: 'Buy and sell verified academic documents, exam solutions, and study materials.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
