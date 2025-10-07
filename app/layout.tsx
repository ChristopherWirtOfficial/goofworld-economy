import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Goof World',
  description: 'Stabilize the chaos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
