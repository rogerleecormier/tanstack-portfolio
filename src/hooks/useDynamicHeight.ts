import { useState, useEffect, useCallback } from 'react'

interface UseDynamicHeightOptions {
  containerRef: React.RefObject<HTMLElement>
  itemHeight: number
  minItems?: number
  maxItems?: number
  padding?: number
}

/**
 * Custom hook to calculate how many items can fit in a container based on available height
 * @param containerRef - Reference to the container element
 * @param itemHeight - Height of each item in pixels
 * @param minItems - Minimum number of items to show (default: 1)
 * @param maxItems - Maximum number of items to show (default: 10)
 * @param padding - Additional padding to account for (default: 0)
 * @returns Number of items that can fit in the available height
 */
export function useDynamicHeight({
  containerRef,
  itemHeight,
  minItems = 1,
  maxItems = 10,
  padding = 0
}: UseDynamicHeightOptions): number {
  const [itemCount, setItemCount] = useState(minItems)

  const calculateItemCount = useCallback(() => {
    if (!containerRef.current) return minItems

    const containerHeight = containerRef.current.offsetHeight
    const availableHeight = containerHeight - padding
    
    // Calculate how many items can fit
    const calculatedCount = Math.floor(availableHeight / itemHeight)
    
    // Clamp between min and max
    const clampedCount = Math.max(minItems, Math.min(maxItems, calculatedCount))
    
    console.log('🔍 Dynamic Height Calculation:', {
      containerHeight,
      availableHeight,
      itemHeight,
      padding,
      calculatedCount,
      clampedCount
    })
    
    setItemCount(clampedCount)
  }, [containerRef, itemHeight, minItems, maxItems, padding])

  useEffect(() => {
    calculateItemCount()

    // Recalculate on window resize
    const handleResize = () => {
      calculateItemCount()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateItemCount])

  // Use ResizeObserver to detect container size changes
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      calculateItemCount()
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [containerRef, calculateItemCount])

  return itemCount
}

/**
 * Hook specifically for related content that calculates available height
 * based on the main content area and sidebar constraints
 */
export function useRelatedContentHeight(
  mainContentRef: React.RefObject<HTMLElement>,
  sidebarRef: React.RefObject<HTMLElement>
): number {
  const [availableHeight, setAvailableHeight] = useState(400) // Default fallback

  const calculateHeight = useCallback(() => {
    if (!mainContentRef.current || !sidebarRef.current) return

    const mainContentHeight = mainContentRef.current.offsetHeight
    const sidebarHeight = sidebarRef.current.offsetHeight
    
    // Use the smaller of the two heights to ensure content doesn't overflow
    const maxHeight = Math.min(mainContentHeight, sidebarHeight)
    
    // Account for padding, margins, and other UI elements
    const adjustedHeight = maxHeight - 100 // 100px buffer for padding/margins
    
    setAvailableHeight(Math.max(200, adjustedHeight)) // Minimum 200px
  }, [mainContentRef, sidebarRef])

  useEffect(() => {
    calculateHeight()

    const handleResize = () => {
      calculateHeight()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateHeight])

  useEffect(() => {
    if (!mainContentRef.current || !sidebarRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      calculateHeight()
    })

    resizeObserver.observe(mainContentRef.current)
    resizeObserver.observe(sidebarRef.current)
    return () => resizeObserver.disconnect()
  }, [mainContentRef, sidebarRef, calculateHeight])

  return availableHeight
}
