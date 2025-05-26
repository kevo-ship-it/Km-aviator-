import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-dark">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <Link href="/">
          <a className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors">
            Go Home
          </a>
        </Link>
      </div>
    </div>
  );
            }
