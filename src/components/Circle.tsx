import { FC, useEffect, useRef } from 'react';
import { Position, Size } from './Block';

export type Type = 'LeftTop' | 'RightTop' | 'LeftBottom' | 'Rightbottom';

export const Circle: FC<
  React.SVGAttributes<SVGCircleElement> & {
    updatePosition: (value: Position) => void;
    updateSize: (value: Size) => void;
    position: Position;
    size: Size;
    type: Type;
  }
> = ({ type, updatePosition, updateSize, position, size, ...props }) => {
  const positionRef = useRef(position);
  const sizeRef = useRef(size);
  const circleRef = useRef<SVGCircleElement>(null);

  positionRef.current = position;
  sizeRef.current = size;

  useEffect(() => {
    let mousedown = false;
    const prevPosition: Position = { x: 0, y: 0 };
    const circle = circleRef.current as SVGCircleElement;

    const onMouseDown = (e: MouseEvent) => {
      const element = e.target as Element;
      if (element !== circle) return;

      mousedown = true;
      prevPosition.x = e.clientX;
      prevPosition.y = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mousedown) return;

      const dx = e.clientX - prevPosition.x;
      const dy = e.clientY - prevPosition.y;

      if (type === 'Rightbottom') {
        updateSize({
          width: sizeRef.current.width + dx,
          height: sizeRef.current.height + dy,
        });
      }

      if (type === 'RightTop') {
        updateSize({
          width: sizeRef.current.width + dx,
          height: sizeRef.current.height - dy,
        });
        updatePosition({
          ...positionRef.current,
          y: positionRef.current.y + dy,
        });
      }

      if (type === 'LeftTop') {
        updateSize({
          width: sizeRef.current.width - dx,
          height: sizeRef.current.height - dy,
        });
        updatePosition({
          x: positionRef.current.x + dx,
          y: positionRef.current.y + dy,
        });
      }

      if (type === 'LeftBottom') {
        updateSize({
          width: sizeRef.current.width - dx,
          height: sizeRef.current.height + dy,
        });
        updatePosition({
          ...positionRef.current,
          x: positionRef.current.x + dx,
        });
      }

      prevPosition.x = e.clientX;
      prevPosition.y = e.clientY;
    };

    const onMouseUp = () => {
      if (!mousedown) return;
      mousedown = false;
    };

    window.addEventListener('mousedown', onMouseDown, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: false });
    window.addEventListener('mousemove', onMouseMove, { passive: false });

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <circle {...props} ref={circleRef} r={6} fill="red" />;
};
