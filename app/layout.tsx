/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import '@/src/index.css';

export const metadata = {
  title: 'Snake Legends | Next-Gen Multi-Universe Arena',
  description: 'An advanced real-time HTML5 3D WebGL multiplayer snake slither combat game featuring customizable skins, achievements, clan warfare, and Ranked leagues.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#050505] text-white selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
