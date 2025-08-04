import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidChartProps {
  chart: string
  className?: string
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart, className = '' }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    // Initialize mermaid with experimental features enabled
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      xyChart: {
        useMaxWidth: true,
        chartOrientation: 'vertical',
        width: 700,
        height: 400
      }
    })

    const renderChart = async () => {
      if (chartRef.current) {
        try {
          // Clear previous content
          chartRef.current.innerHTML = ''
          
          // Force Mermaid to recognize experimental charts
          const trimmedChart = chart.trim()
          
          // Check if it's an xychart and add proper config
          if (trimmedChart.includes('xychart-beta')) {
            const configuredChart = `%%{init: {'xyChart': {'useMaxWidth': true}}}%%\n${trimmedChart}`
            const { svg } = await mermaid.render(chartId.current, configuredChart)
            chartRef.current.innerHTML = svg
          } else {
            const { svg } = await mermaid.render(chartId.current, trimmedChart)
            chartRef.current.innerHTML = svg
          }
          
        } catch (error) {
          console.error('Error rendering Mermaid chart:', error)
          chartRef.current.innerHTML = `
            <div class="text-red-500 p-4 border border-red-200 rounded bg-red-50">
              <strong>Chart Error:</strong> ${error}
              <pre class="mt-2 text-xs overflow-x-auto">${chart}</pre>
            </div>
          `
        }
      }
    }

    // Add a small delay to ensure Mermaid is fully loaded
    const timer = setTimeout(renderChart, 100)
    
    return () => clearTimeout(timer)
  }, [chart])

  return (
    <div 
      ref={chartRef} 
      className={`mermaid-chart my-6 flex justify-center ${className}`}
      style={{ textAlign: 'center', minHeight: '200px' }}
    />
  )
}

export default MermaidChart