export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="text-purple-600 hover:text-purple-800 font-medium">
        Return to Home
      </a>
    </div>
  );
} 