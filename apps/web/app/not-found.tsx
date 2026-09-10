import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container stack" style={{ paddingTop: '5rem', textAlign: 'center' }}>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/app">Return Home</Link>
    </div>
  )
}
