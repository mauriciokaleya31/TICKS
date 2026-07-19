import React, { useMemo } from "react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ value, size = 150, className = "" }: QRCodeGeneratorProps) {
  // Deterministic noise grid based on the input value to make each QR code unique
  const grid = useMemo(() => {
    const hashString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    const hash = hashString(value);
    const sizeMatrix = 21; // 21x21 grid (QR Version 1 standard)
    const matrix: boolean[][] = [];

    for (let r = 0; r < sizeMatrix; r++) {
      matrix[r] = [];
      for (let c = 0; c < sizeMatrix; c++) {
        // Corner Finder Patterns
        // Top-Left (0-6, 0-6)
        if (r <= 6 && c <= 6) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[r][c] = isBorder || isCenter;
          continue;
        }
        // Top-Right (0-6, 14-20)
        if (r <= 6 && c >= 14) {
          const adjC = c - 14;
          const isBorder = r === 0 || r === 6 || adjC === 0 || adjC === 6;
          const isCenter = r >= 2 && r <= 4 && adjC >= 2 && adjC <= 4;
          matrix[r][c] = isBorder || isCenter;
          continue;
        }
        // Bottom-Left (14-20, 0-6)
        if (r >= 14 && c <= 6) {
          const adjR = r - 14;
          const isBorder = adjR === 0 || adjR === 6 || c === 0 || c === 6;
          const isCenter = adjR >= 2 && adjR <= 4 && c >= 2 && c <= 4;
          matrix[r][c] = isBorder || isCenter;
          continue;
        }

        // Small alignment pattern at (15, 15)
        if (r >= 14 && r <= 16 && c >= 14 && c <= 16) {
          matrix[r][c] = r === 15 || c === 15;
          continue;
        }

        // Timing patterns (straight lines of alternating pixels)
        if (r === 6 || c === 6) {
          matrix[r][c] = (r === 6 ? c : r) % 2 === 0;
          continue;
        }

        // Generate data bytes using a pseudo-random deterministic generator seeded with hash + cell coordinates
        const seed = hash + r * 137 + c * 241;
        const rand = Math.sin(seed) * 10000;
        matrix[r][c] = (rand - Math.floor(rand)) > 0.45;
      }
    }
    return matrix;
  }, [value]);

  return (
    <div className={`flex flex-col items-center justify-center p-2 bg-white text-gray-900 rounded-lg border border-gray-100 qr-code-container-white ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 21 21"
        shapeRendering="crispEdges"
        style={{ width: size, height: size }}
        className="text-gray-900"
      >
        <rect width="21" height="21" fill="white" />
        {grid.map((row, rIndex) =>
          row.map((cell, cIndex) => {
            if (cell) {
              return (
                <rect
                  key={`${rIndex}-${cIndex}`}
                  x={cIndex}
                  y={rIndex}
                  width="1"
                  height="1"
                  fill="currentColor"
                />
              );
            }
            return null;
          })
        )}
      </svg>
      <span className="font-mono text-[9px] mt-2 tracking-widest text-gray-400 select-all">
        {value}
      </span>
    </div>
  );
}
