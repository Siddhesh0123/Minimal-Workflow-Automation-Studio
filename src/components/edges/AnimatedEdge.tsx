// Animated edge with data packet animation during runs

import React from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

export const AnimatedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const isActive = data?.active === true;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isActive ? 'var(--color-accent)' : 'var(--color-border-hover)',
          strokeWidth: isActive ? 2 : 1.5,
          transition: 'stroke 0.3s ease-out, stroke-width 0.3s ease-out',
        }}
      />
      {/* Data packet dot during active run */}
      {isActive && (
        <circle r="4" fill="var(--color-accent)">
          <animateMotion
            dur="1s"
            repeatCount="indefinite"
            path={edgePath}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </>
  );
};
