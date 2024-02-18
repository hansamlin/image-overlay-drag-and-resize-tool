import { FC, useEffect, useRef, useState } from 'react';
import { Circle } from './Circle';
import { RainbowHex } from '../../utils/constant';
import { cx } from '../../utils/cx';
import { Input } from './Input';
import { uuid } from '../../utils/uuid';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface IBlock {
  id: string;
  text: string;
  position: Position;
  size: Size;
  windowNum: number;
  windows: IBlock[];
  color: RainbowHex;
}

export const Block: FC<
  IBlock & {
    setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>;
    order: number;
    isWindow?: boolean;
  }
> = ({
  position,
  text,
  size,
  setBlocks,
  order,
  windowNum,
  id,
  color,
  windows,
  isWindow = false,
}) => {
  const foreignObjectRef = useRef<SVGForeignObjectElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const windowNumRef = useRef<HTMLInputElement>(null);
  const [isBlockFocus, setIsBlockFocus] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);

  const positionRef = useRef(position);

  positionRef.current = position;

  const updateFiled =
    <T,>(field: keyof IBlock) =>
    (value: T) => {
      if (isWindow) {
        setBlocks((prev) => {
          const target = prev.find((_, i) => i === order) as IBlock;

          const index = target.windows.findIndex((e) => e.id === id);

          const newWindows = target.windows.slice(0, index).concat(
            [
              {
                ...target.windows[index],
                [field]: value,
              },
            ],
            target.windows.slice(index + 1),
          );

          return prev.slice(0, order).concat(
            [
              {
                ...(prev.find((_, i) => i === order) as IBlock),
                windows: newWindows,
              },
            ],
            prev.slice(order + 1),
          );
        });
      } else {
        setBlocks((prev) =>
          prev.slice(0, order).concat(
            [
              {
                ...(prev.find((_, i) => i === order) as IBlock),
                [field]: value,
              },
            ],
            prev.slice(order + 1),
          ),
        );
      }
    };

  const updatePosition = updateFiled<Position>('position');

  const updateSize = updateFiled<Size>('size');

  const updateText = updateFiled<string>('text');

  const updateWindowNum = updateFiled<number>('windowNum');

  const updateWindows = updateFiled<IBlock[]>('windows');

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const element = e.target as Element;
      const div = divRef.current as HTMLDivElement;

      if (div.contains(element)) {
        setIsBlockFocus(true);
        return;
      }

      const foreignObject = foreignObjectRef.current as SVGForeignObjectElement;

      const isCircle =
        element === foreignObject.nextElementSibling ||
        element === foreignObject.nextElementSibling?.nextElementSibling ||
        element ===
          foreignObject.nextElementSibling?.nextElementSibling
            ?.nextElementSibling ||
        element ===
          foreignObject.nextElementSibling?.nextElementSibling
            ?.nextElementSibling?.nextElementSibling;

      setIsBlockFocus(isCircle);
    };

    window.addEventListener('click', onClick, { passive: false });

    return () => {
      window.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mousedown = false;
    let prevPosition = { x: 0, y: 0 };

    const divElement = divRef.current as HTMLDivElement;
    const textInputElement = textRef.current as HTMLInputElement;
    const windowNumInputElement = windowNumRef.current as HTMLInputElement;

    const onMouseDown = (e: MouseEvent) => {
      const element = e.target as Element;

      if (element !== divElement && !divElement.contains(element)) {
        return;
      }

      mousedown = true;
      prevPosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!mousedown) return;

      const dx = e.clientX - prevPosition.x;
      const dy = e.clientY - prevPosition.y;

      divElement.setAttribute('style', 'cursor:grabbing');
      textInputElement.setAttribute('style', 'cursor:grabbing');
      windowNumInputElement?.setAttribute('style', 'cursor:grabbing');

      const newPositionX = Math.floor(positionRef.current.x + dx);
      const newPositionY = Math.floor(positionRef.current.y + dy);

      prevPosition.x = e.clientX;
      prevPosition.y = e.clientY;

      updatePosition({
        x: newPositionX,
        y: newPositionY,
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      if (!mousedown) return;

      divElement.removeAttribute('style');
      textInputElement.removeAttribute('style');
      windowNumInputElement?.removeAttribute('style');
      mousedown = false;
      prevPosition = { x: 0, y: 0 };
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
    if (isWindow) return;

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
    // setText(e.target.value);
    updateText(e.target.value);
  };

  const onWindowNumChange = () => {
    return;
  };

  const onInputFocus = () => {
    setIsInputFocus(true);
  };

  const onInputBlur = () => {
    setIsInputFocus(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isArrowUp = e.code === 'ArrowUp';
    const isArrowDown = e.code === 'ArrowDown';

    if (!isArrowDown && !isArrowUp) {
      e.preventDefault();
      return;
    }

    if (isArrowDown) {
      updateWindowNum(windowNum - 1 < 0 ? 0 : windowNum - 1);

      const newWindows = windows.slice(0, windows.length - 1);
      updateWindows(newWindows);
    }

    if (isArrowUp) {
      updateWindowNum(windowNum + 1);

      const newWindows = windows.concat([
        {
          text: String(windows.length + 1),
          position: {
            x: position.x,
            y: position.y,
          },
          size: {
            width: 30,
            height: 26,
          },
          windowNum: 0,
          id: uuid(),
          color,
          windows: [],
        },
      ]);
      updateWindows(newWindows);
    }
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
          className={cx('block h-full w-full', color, !isWindow && 'p-2')}
        >
          {!isWindow && (
            <>
              <div className="flex items-center h-5">
                <span className="flex-shrink-0">空間名稱:</span>
                <Input
                  ref={textRef}
                  type="text"
                  value={text}
                  onChange={onTextChange}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
              </div>
              <div className="flex items-center h-5 mt-3">
                <span className="flex-shrink-0">窗戶數量:</span>
                <Input
                  ref={windowNumRef}
                  value={windowNum}
                  onChange={onWindowNumChange}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  onKeyDown={onKeyDown}
                />
              </div>
            </>
          )}

          {isWindow && (
            <Input
              ref={textRef}
              value={text}
              className="text-center p-0 border-none focus-within:outline-none"
              readOnly
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            />
          )}
        </div>
      </foreignObject>
      {!isWindow && isBlockFocus && (
        <>
          <Circle
            type="LeftTop"
            updatePosition={updatePosition}
            updateSize={updateSize}
            size={size}
            position={position}
            cx={position.x}
            cy={position.y}
          />
          <Circle
            type="Rightbottom"
            updatePosition={updatePosition}
            updateSize={updateSize}
            size={size}
            position={position}
            cx={position.x + size.width}
            cy={position.y + size.height}
          />
          <Circle
            type="RightTop"
            updatePosition={updatePosition}
            updateSize={updateSize}
            size={size}
            position={position}
            cx={position.x + size.width}
            cy={position.y}
          />
          <Circle
            type="LeftBottom"
            updatePosition={updatePosition}
            updateSize={updateSize}
            size={size}
            position={position}
            cx={position.x}
            cy={position.y + size.height}
          />
        </>
      )}
    </>
  );
};
