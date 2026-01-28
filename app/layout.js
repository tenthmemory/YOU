import './globals.css'

export const metadata = {
  title: 'YOU - Create Your Digital Consciousness',
  description: 'Create a digital twin that thinks like you, talks like you, and evolves.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        {children}
      </body>
    </html>
  )
}
