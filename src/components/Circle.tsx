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
  const mousedownRef = useRef(false);
  const prevPositionRef = useRef({ x: 0, y: 0 });
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const circle = circleRef.current as SVGCircleElement;

    const onMouseDown = (e: MouseEvent) => {
      const element = e.target as Element;
      if (element !== circle) return;

      mousedownRef.current = true;
      prevPositionRef.current.x = e.clientX;
      prevPositionRef.current.y = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mousedownRef.current) return;

      const dx = e.clientX - prevPositionRef.current.x;
      const dy = e.clientY - prevPositionRef.current.y;

      if (type === 'Rightbottom') {
        updateSize({ width: size.width + dx, height: size.height + dy });
      }

      if (type === 'RightTop') {
        updateSize({ width: size.width + dx, height: size.height - dy });
        updatePosition({ ...position, y: position.y + dy });
      }

      if (type === 'LeftTop') {
        updateSize({ width: size.width - dx, height: size.height - dy });
        updatePosition({ x: position.x + dx, y: position.y + dy });
      }

      if (type === 'LeftBottom') {
        updateSize({ width: size.width - dx, height: size.height + dy });
        updatePosition({ ...position, x: position.x + dx });
      }

      prevPositionRef.current.x = e.clientX;
      prevPositionRef.current.y = e.clientY;
    };

    const onMouseUp = () => {
      if (!mousedownRef.current) return;
      mousedownRef.current = false;
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
