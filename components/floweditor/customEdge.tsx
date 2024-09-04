import React from 'react';
import { EdgeProps, getSmoothStepPath } from '@xyflow/react';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2AFFED" />
          <stop offset="33%" stopColor="#838587" />
          <stop offset="66%" stopColor="#FFF" />
          <stop offset="100%" stopColor="#2AFFED" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-1"
            to="1"
            dur="4s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <g className="group">
        <path
          id={id}
          className="stroke-[4px] group-hover:stroke-[6px] group-hover:stroke-white react-flow__edge-path"
          d={edgePath}
          style={{ stroke: `url(#gradient-${id})` }}
        />
        <path
          id={`${id}-interaction`}
          className="stroke-[25px] stroke-transparent fill-none cursor-pointer"
          d={edgePath}
          style={{ pointerEvents: 'stroke' }}
        />
      </g>
    </>
  );
};

export default CustomEdge;