import { FC, useEffect, useRef, useState } from 'react';
import { Circle } from './Circle';

export interface IBlock {
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const Block: FC<
  IBlock & {
    setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>;
    order: number;
  }
> = ({ position: _position, text: _text, size: _size, setBlocks, order }) => {
  const [text, setText] = useState(_text);
  const mousedownRef = useRef(false);
  const prevPositionRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState(_position);
  const foreignObjectRef = useRef<SVGForeignObjectElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState(_size);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    setBlocks((prev) => {
      return prev.slice(0, order).concat(
        [
          {
            position,
            size,
            text,
          },
        ],
        prev.slice(order + 1),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, size, text]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const element = e.target as Element;
      if (!element.contains(divRef.current)) {
        setIsFocus(false);
      }
    };

    window.addEventListener('click', onClick, { passive: false });

    return () => {
      window.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const element = e.target as Element;

      if (element !== divRef.current && element !== inputRef.current) {
        return;
      }

      mousedownRef.current = true;
      prevPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!mousedownRef.current) return;

      const dx = e.clientX - prevPositionRef.current.x;
      const dy = e.clientY - prevPositionRef.current.y;

      setPosition((prev) => {
        const newPositionX = Math.floor(prev.x + dx);
        const newPositionY = Math.floor(prev.y + dy);

        prevPositionRef.current.x = e.clientX;
        prevPositionRef.current.y = e.clientY;

        return {
          x: newPositionX,
          y: newPositionY,
        };
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      if (!mousedownRef.current) return;

      mousedownRef.current = false;
      prevPositionRef.current = { x: 0, y: 0 };
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  return (
    <>
      <foreignObject
        ref={foreignObjectRef}
        width={size.width}
        height={size.height}
        x={position.x}
        y={position.y}
      >
        <div
          ref={divRef}
          className="bg-yellow-700/50 h-full w-full"
          onClick={() => {
            setIsFocus(true);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="input border-none bg-[transparent] focus-within:outline-none p-4"
            value={text}
            onChange={onChange}
          />
        </div>
      </foreignObject>
      {isFocus && (
        <>
          <Circle
            type="LeftTop"
            setPosition={setPosition}
            setSize={setSize}
            cx={position.x}
            cy={position.y}
          />
          <Circle
            type="Rightbottom"
            setPosition={setPosition}
            setSize={setSize}
            cx={position.x + size.width}
            cy={position.y + size.height}
          />
          <Circle
            type="RightTop"
            setPosition={setPosition}
            setSize={setSize}
            cx={position.x + size.width}
            cy={position.y}
          />
          <Circle
            type="LeftBottom"
            setPosition={setPosition}
            setSize={setSize}
            cx={position.x}
            cy={position.y + size.height}
          />
        </>
      )}
    </>
  );
};
