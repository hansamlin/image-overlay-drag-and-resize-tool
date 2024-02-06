import { FC, useEffect, useRef } from 'react';

export type Type = 'LeftTop' | 'RightTop' | 'LeftBottom' | 'Rightbottom';

export const Circle: FC<
  React.SVGAttributes<SVGCircleElement> & {
    setSize: React.Dispatch<
      React.SetStateAction<{ width: number; height: number }>
    >;
    setPosition: React.Dispatch<
      React.SetStateAction<{
        x: number;
        y: number;
      }>
    >;
    type: Type;
  }
> = ({ setSize, setPosition, type, ...props }) => {
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
        setSize((prev) => {
          return { width: prev.width + dx, height: prev.height + dy };
        });
      }

      if (type === 'RightTop') {
        setSize((prev) => {
          return { width: prev.width + dx, height: prev.height - dy };
        });
        setPosition((prev) => ({ ...prev, y: prev.y + dy }));
      }

      if (type === 'LeftTop') {
        setSize((prev) => {
          return { width: prev.width - dx, height: prev.height - dy };
        });
        setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      }

      if (type === 'LeftBottom') {
        setSize((prev) => {
          return { width: prev.width - dx, height: prev.height + dy };
        });
        setPosition((prev) => ({ ...prev, x: prev.x + dx }));
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
