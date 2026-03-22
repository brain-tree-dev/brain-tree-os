import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BrainTree OS',
    template: '%s | BrainTree OS',
  },
  description: 'Open source brain viewer for AI-native project management.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </head>
      <body className="flex h-screen flex-col antialiased">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  )
}
