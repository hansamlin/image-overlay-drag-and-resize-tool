import { FC, useEffect, useRef, useState } from 'react';
import { Circle } from './Circle';
import { RainbowHex } from '../../utils/constant';
import { cx } from '../../utils/cx';

export interface IBlock {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  windowNum: number;
  color: RainbowHex;
}

export const Block: FC<
  IBlock & {
    setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>;
    order: number;
  }
> = ({
  position: _position,
  text: _text,
  size: _size,
  setBlocks,
  order,
  windowNum: _windowNum,
  id,
  color,
}) => {
  const [text, setText] = useState(_text);
  const mousedownRef = useRef(false);
  const prevPositionRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState(_position);
  const foreignObjectRef = useRef<SVGForeignObjectElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const windowNumRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState(_size);
  const [isBlockFocus, setIsBlockFocus] = useState(false);
  const [windowNum, setWindowNum] = useState(_windowNum);
  const [isInputFocus, setIsInputFocus] = useState(false);

  useEffect(() => {
    setBlocks((prev) => {
      return prev.slice(0, order).concat(
        [
          {
            id,
            position,
            size,
            text,
            windowNum,
            color,
          },
        ],
        prev.slice(order + 1),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, size, text, windowNum]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const element = e.target as Element;

      if (!element.contains(divRef.current)) {
        setIsBlockFocus(false);
      }

      if (element === divRef.current || divRef.current?.contains(element)) {
        setIsBlockFocus(true);
      }
    };

    window.addEventListener('click', onClick, { passive: false });

    return () => {
      window.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const divElement = divRef.current as HTMLDivElement;
    const textInputElement = textRef.current as HTMLInputElement;
    const windowNumInputElement = windowNumRef.current as HTMLInputElement;

    const onMouseDown = (e: MouseEvent) => {
      const element = e.target as Element;

      if (element !== divElement && !divElement.contains(element)) {
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

      divElement.setAttribute('style', 'cursor:grabbing');
      textInputElement.setAttribute('style', 'cursor:grabbing');
      windowNumInputElement.setAttribute('style', 'cursor:grabbing');

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

      divElement.removeAttribute('style');
      textInputElement.removeAttribute('style');
      windowNumInputElement.removeAttribute('style');
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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        !isInputFocus &&
        isBlockFocus &&
        e.key.toLocaleUpperCase() === 'BACKSPACE'
      ) {
        setBlocks((prev) => {
          return prev.filter((block) => {
            return block.id !== id;
          });
        });
      }
    }

    window.addEventListener('keydown', onKeyDown, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlockFocus, isInputFocus]);

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const onWindowNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNaN(Number(e.target.value))) {
      setWindowNum(0);
    } else {
      setWindowNum(Number(e.target.value));
    }
  };

  const onInputFocus = () => {
    setIsInputFocus(true);
  };

  const onInputBlur = () => {
    setIsInputFocus(false);
  };

  return (
    <>
      <foreignObject
        ref={foreignObjectRef}
        width={size.width}
        height={size.height}
        x={position.x}
        y={position.y}
        className="foreignObject"
      >
        <div
          ref={divRef}
          className={cx('block h-full w-full p-2', color)}
        >
          <div className="flex items-center h-5">
            <span className="flex-shrink-0">空間名稱:</span>
            <input
              ref={textRef}
              type="text"
              className="input border-none bg-[transparent] focus-within:outline-none px-2 w-full"
              value={text}
              onChange={onTextChange}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            />
          </div>
          <div className="flex items-center h-5 mt-3">
            <span className="flex-shrink-0">窗戶數量:</span>
            <input
              ref={windowNumRef}
              type="text"
              className="input border-none bg-[transparent] focus-within:outline-none px-2 w-full"
              value={windowNum}
              onChange={onWindowNumChange}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            />
          </div>
        </div>
      </foreignObject>
      {isBlockFocus && (
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
