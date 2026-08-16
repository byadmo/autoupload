import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoUpload Shorts',
  description: 'Upload and publish vertical videos to YouTube Shorts.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
