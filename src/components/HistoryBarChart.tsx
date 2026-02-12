import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTheme2 } from '@grafana/ui';
import { getOutcomeColor } from '../types';

interface HistoryBarChartProps {
  durations: number[];
  outcomes: string[];
  runIds: string[];
  urls: string[];
  startedTimes: string[];
  completionTimes: string[];
  maxValue: number;
  barWidth: number;
  barHeight: number;
  barGap: number;
  /** Optional queue durations rendered mirrored below run bars */
  queueDurations?: number[];
  /** Gap in pixels between run and queue sections */
  mirrorGap?: number;
}

export const HistoryBarChart: React.FC<HistoryBarChartProps> = ({
  durations,
  outcomes,
  runIds,
  urls,
  startedTimes,
  completionTimes,
  maxValue,
  barWidth = 8,
  barHeight = 20,
  barGap = 2,
  queueDurations,
  mirrorGap = 1,
}) => {
  const theme = useTheme2();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const hasQueue = queueDurations && queueDurations.length > 0;
  const barCount = durations.length;
  const canvasWidth = barCount * (barWidth + barGap);
  const runSectionHeight = barHeight;
  const queueSectionHeight = hasQueue ? barHeight : 0;
  const gapHeight = hasQueue ? mirrorGap : 0;
  const canvasHeight = runSectionHeight + gapHeight + queueSectionHeight;
  const baseline = runSectionHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw run bars (growing upward from baseline)
    durations.forEach((duration, index) => {
      const x = index * (barWidth + barGap);
      const scaledH = maxValue > 0 ? (duration / maxValue) * runSectionHeight : 0;
      const y = baseline - scaledH;

      ctx.fillStyle = getOutcomeColor(outcomes[index]);
      ctx.fillRect(x, y, barWidth, scaledH);

      if (hoveredIndex === index) {
        ctx.strokeStyle = theme.colors.emphasize(getOutcomeColor(outcomes[index]), 0.2);
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, y - 1, barWidth + 2, scaledH + 2);
      }
    });

    // Draw queue bars (growing downward from baseline + gap)
    if (hasQueue && queueDurations) {
      const queueTop = baseline + gapHeight;
      queueDurations.forEach((duration, index) => {
        const x = index * (barWidth + barGap);
        const scaledH = maxValue > 0 ? (duration / maxValue) * queueSectionHeight : 0;

        const baseColor = getOutcomeColor(outcomes[index]);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, queueTop, barWidth, scaledH);
        ctx.globalAlpha = 1.0;

        if (hoveredIndex === index) {
          ctx.strokeStyle = theme.colors.emphasize(baseColor, 0.2);
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 1, queueTop - 1, barWidth + 2, scaledH + 2);
        }
      });
    }
  }, [
    durations,
    outcomes,
    maxValue,
    barWidth,
    barHeight,
    barGap,
    canvasWidth,
    canvasHeight,
    baseline,
    gapHeight,
    hoveredIndex,
    theme,
    hasQueue,
    queueDurations,
    runSectionHeight,
    queueSectionHeight,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.floor(x / (barWidth + barGap));

    if (index >= 0 && index < barCount) {
      setHoveredIndex(index);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredIndex(null);
      setTooltipPos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.floor(x / (barWidth + barGap));

    if (index >= 0 && index < barCount && urls[index]) {
      window.open(urls[index], '_blank');
    }
  };

  const tooltip =
    hoveredIndex !== null && tooltipPos
      ? (() => {
          const i = hoveredIndex;
          const startedTime = startedTimes[i];
          const completionTime = completionTimes[i];
          const queueDuration = queueDurations?.[i];

          return (
            <div
              style={{
                position: 'fixed',
                left: tooltipPos.x + 8,
                top: tooltipPos.y - 8,
                transform: 'translateY(-100%)',
                background: theme.colors.background.primary,
                border: `1px solid ${theme.colors.border.medium}`,
                borderRadius: '4px',
                boxShadow: theme.shadows.z3,
                zIndex: 10000,
                pointerEvents: 'none',
                padding: '8px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{runIds[i]}</div>
              <div>
                <strong>Outcome:</strong> <span style={{ color: getOutcomeColor(outcomes[i]) }}>{outcomes[i]}</span>
              </div>
              <div>
                <strong>Duration:</strong> {durations[i].toFixed(1)}s
              </div>
              {queueDuration !== undefined && (
                <div>
                  <strong>Queue:</strong> {queueDuration.toFixed(1)}s
                </div>
              )}
              {startedTime && (
                <div>
                  <strong>Started:</strong> {startedTime}
                </div>
              )}
              {completionTime && (
                <div>
                  <strong>Completed:</strong> {completionTime}
                </div>
              )}
              <div style={{ marginTop: '4px', fontSize: '0.85em', color: theme.colors.text.secondary }}>
                Click to open details
              </div>
            </div>
          );
        })()
      : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
      {tooltip && ReactDOM.createPortal(tooltip, document.body)}
    </div>
  );
};
