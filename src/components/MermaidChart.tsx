import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
  className?: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({
  chart,
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartId = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`);
  const inited = useRef(false);

  useEffect(() => {
    if (!chart || chart.trim() === "") {
      if (chartRef.current) chartRef.current.innerHTML = "";
      return; // Skip rendering if chart string is empty
    }

    // Initialize Mermaid ONCE (xychart-beta support + safe defaults)
    if (!inited.current) {
      mermaid.initialize({
        startOnLoad: false,
        // theme: "forest", // <-- removed theme
        securityLevel: "loose",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 14,
        xyChart: {
          useMaxWidth: true,
          chartOrientation: "vertical",
          width: 1200,
          height: 400,
        },
      });
      inited.current = true;
    }

    const renderChart = async () => {
      if (!chartRef.current) return;

      try {
        chartRef.current.innerHTML = "";

        // Normalize line breaks to ensure y-axis starts on a new line
        let src = chart.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        const hasInitFirst = /^\s*%%\{.*?init.*?\}%%/m.test(src);
        const needsXyInit = /xychart-beta/.test(src);

        // Only add an init if none present; use valid JSON (double quotes)
        if (!hasInitFirst && needsXyInit) {
          const injected = `%%{init: {"xyChart": {"useMaxWidth": true}}}%%\n`;
          src = injected + src;
        }

        // normalize newlines
        src = src.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        // add init only if missing
        const hasInitSecond = /^\s*%%\{.*?init.*?\}%%/m.test(src);
        if (!hasInitSecond && /xychart-beta/.test(src)) {
          src =
            `%%{init: {"theme":"forest","xyChart":{"useMaxWidth":true}}}%%\n` +
            src;
        }

        // ensure newline after angle line (avoid 45y-axis)
        src = src.replace(
          /x-axis-label-angle\s+(\d+)\s*(?=y-axis)/,
          "x-axis-label-angle $1\n"
        );

        const { svg } = await mermaid.render(chartId.current, src);
        chartRef.current.innerHTML = svg;
      } catch (error) {
        console.error("Error rendering Mermaid chart:", error);
        chartRef.current.innerHTML = `
          <div class="text-red-500 p-4 border border-red-200 rounded bg-red-50">
            <strong>Chart Error:</strong> ${error}
            <pre class="mt-2 text-xs overflow-x-auto">${chart.replace(
              /</g,
              "&lt;"
            )}</pre>
          </div>
        `;
      }
    };

    const timer = setTimeout(renderChart, 50);
    return () => clearTimeout(timer);
  }, [chart]);

  return (
    <div
      ref={chartRef}
      className={`mermaid-chart w-full my-6 flex justify-center ${className}`}
      style={{ textAlign: "center", minHeight: "400px", width: "100%" }}
    />
  );
};

export default MermaidChart;
