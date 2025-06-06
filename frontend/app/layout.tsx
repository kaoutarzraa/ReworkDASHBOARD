import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rework Area dashboard',
  description: 'kaoutar and nouhaila',
  generator: 'us forever',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}