import { useEffect } from 'react'

/**
 * Custom hook to scroll to top when component mounts
 * @param behavior - Scroll behavior ('auto' | 'smooth')
 */
export const useScrollToTopOnMount = (behavior: ScrollBehavior = 'auto') => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior })
  }, [behavior])
}

/**
 * Custom hook to scroll to top after successful form submissions
 * @param success - Boolean indicating if the operation was successful
 * @param behavior - Scroll behavior ('auto' | 'smooth')
 */
export const useScrollToTopOnSuccess = (
  success: boolean,
  behavior: ScrollBehavior = 'smooth'
) => {
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior })
    }
  }, [success, behavior])
}

/**
 * Custom hook to scroll to top with custom dependencies
 * @param behavior - Scroll behavior ('auto' | 'smooth')
 * @param dependencies - Array of dependencies to trigger scroll
 */
export const useScrollToTop = (
  behavior: ScrollBehavior = 'auto',
  dependencies: unknown[] = []
) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [behavior, ...dependencies])
}
