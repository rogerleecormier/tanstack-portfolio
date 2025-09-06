/**
 * Performance Metrics Tests
 * Tests for the performance metrics component and worker manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PerformanceMetrics from '../components/PerformanceMetrics';
import { getCompilerWorkerManager } from '../workers/compiler-worker-manager';

// Mock the worker manager
vi.mock('../workers/compiler-worker-manager', () => ({
  getCompilerWorkerManager: vi.fn(),
}));

describe('Performance Metrics', () => {
  const mockWorkerManager = {
    getMetrics: vi.fn(),
    checkPerformanceTargets: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (
      getCompilerWorkerManager as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(mockWorkerManager);

    // Default mock metrics
    mockWorkerManager.getMetrics.mockReturnValue({
      p50: 150,
      p95: 300,
      count: 25,
      average: 180,
    });

    mockWorkerManager.checkPerformanceTargets.mockReturnValue({
      p50Target: true,
      p95Target: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should render show metrics button initially', () => {
    render(<PerformanceMetrics />);

    expect(screen.getByText('Show Metrics')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show metrics when button is clicked', async () => {
    render(<PerformanceMetrics />);

    const showButton = screen.getByText('Show Metrics');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getByText('P95')).toBeInTheDocument();
    });
  });

  it('should display performance metrics correctly', async () => {
    render(<PerformanceMetrics />);

    const showButton = screen.getByText('Show Metrics');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('150ms')).toBeInTheDocument(); // P50
      expect(screen.getByText('300ms')).toBeInTheDocument(); // P95
      expect(screen.getByText('180ms')).toBeInTheDocument(); // Average
      expect(screen.getByText('25')).toBeInTheDocument(); // Count
    });
  });

  it('should show target status correctly when targets are met', async () => {
    render(<PerformanceMetrics />);

    const showButton = screen.getByText('Show Metrics');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('All targets met')).toBeInTheDocument();
    });
  });

  it('should show target status correctly when targets are missed', async () => {
    mockWorkerManager.checkPerformanceTargets.mockReturnValue({
      p50Target: false,
      p95Target: true,
    });

    render(<PerformanceMetrics />);

    const showButton = screen.getByText('Show Metrics');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Some targets missed')).toBeInTheDocument();
    });
  });

  it('should format time values correctly', async () => {
    mockWorkerManager.getMetrics.mockReturnValue({
      p50: 0.5,
      p95: 5.2,
      count: 10,
      average: 2.8,
    });

    render(<PerformanceMetrics />);

    const showButton = screen.getByText('Show Metrics');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('<1ms')).toBeInTheDocument(); // P50 < 1ms
      expect(screen.getByText('5.2ms')).toBeInTheDocument(); // P95
      expect(screen.getByText('2.8ms')).toBeInTheDocument(); // Average
    });
  });

  it('should close metrics when close button is clicked', async () => {
    render(<PerformanceMetrics />);

    const showButton = screen.getByText('Show Metrics');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.getByText('Show Metrics')).toBeInTheDocument();
      expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument();
    });
  });

  it('should call getMetrics when component mounts', async () => {
    render(<PerformanceMetrics />);

    // Should call getMetrics on mount
    await waitFor(() => {
      expect(mockWorkerManager.getMetrics).toHaveBeenCalled();
    });
  });
});

describe('Compiler Worker Manager', () => {
  const mockManager = {
    getMetrics: vi.fn(),
    checkPerformanceTargets: vi.fn(),
    refreshMetrics: vi.fn(),
    mdToHtml: vi.fn(),
    htmlToMd: vi.fn(),
    destroy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (
      getCompilerWorkerManager as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(mockManager);
  });

  it('should be a singleton', () => {
    const manager1 = getCompilerWorkerManager();
    const manager2 = getCompilerWorkerManager();

    expect(manager1).toBe(manager2);
  });

  it('should provide metrics interface', () => {
    const manager = getCompilerWorkerManager();

    expect(manager.getMetrics).toBeDefined();
    expect(manager.checkPerformanceTargets).toBeDefined();
    expect(manager.refreshMetrics).toBeDefined();
  });

  it('should check performance targets correctly', () => {
    const manager = getCompilerWorkerManager();

    // Mock good performance
    (manager.getMetrics as ReturnType<typeof vi.fn>).mockReturnValue({
      p50: 150,
      p95: 300,
      count: 10,
      average: 200,
    });

    (
      manager.checkPerformanceTargets as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      p50Target: true,
      p95Target: true,
    });

    const targets = manager.checkPerformanceTargets();
    expect(targets.p50Target).toBe(true); // 150 < 200
    expect(targets.p95Target).toBe(true); // 300 < 500
  });

  it('should detect missed performance targets', () => {
    const manager = getCompilerWorkerManager();

    // Mock poor performance
    (manager.getMetrics as ReturnType<typeof vi.fn>).mockReturnValue({
      p50: 250,
      p95: 600,
      count: 10,
      average: 400,
    });

    (
      manager.checkPerformanceTargets as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      p50Target: false,
      p95Target: false,
    });

    const targets = manager.checkPerformanceTargets();
    expect(targets.p50Target).toBe(false); // 250 > 200
    expect(targets.p95Target).toBe(false); // 600 > 500
  });
});
