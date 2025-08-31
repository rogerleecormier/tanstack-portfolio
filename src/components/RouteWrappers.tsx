import { useParams } from '@tanstack/react-router'
import PortfolioPage from '../pages/PortfolioPage'
import ProjectsPage from '../pages/ProjectsPage'

// Wrapper components for dynamic routes
export function PortfolioPageWrapper() {
  const { slug } = useParams({ from: '/portfolio/$slug' })
  return <PortfolioPage file={`portfolio/${slug}`} />
}

export function ProjectsPageWrapper() {
  const { slug } = useParams({ from: '/projects/$slug' })
  return <ProjectsPage file={`projects/${slug}`} />
}

// Error boundary component for the root route
export function RootErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}
