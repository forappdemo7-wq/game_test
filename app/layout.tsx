/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Snake Legends | Cyber Multi-Arena',
  description: 'Real-time multidimensional snake battle arena built on Next.js 15',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full w-full bg-[#050505] antialiased">
        {children}
      </body>
    </html>
  );
}
