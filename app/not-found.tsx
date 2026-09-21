import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-cream">
      <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center mb-8">
        <span className="text-5xl font-bold text-gold">404</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4">Page Not Found</h1>
      <p className="text-lg text-neutral-600 mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It may have been moved or no longer exists.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="border-2 border-cream-dark hover:border-gold text-ink px-8 py-3 rounded-full font-medium transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
