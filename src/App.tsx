import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { Block, IBlock } from './components/Block';
import { uuid } from '../utils/uuid';
import { RainbowHex, rainbowHex } from '../utils/constant';
import { SvgImage } from './components/SvgImage';

const MemoSvgImage = memo(SvgImage);
const MemoBlock = memo(Block);

const getForeignObjectSize = (_foreignObject: SVGForeignObjectElement) => {
  return {
    width: _foreignObject.width.baseVal.value,
    height: _foreignObject.height.baseVal.value,
  };
};

export default function App() {
  const [blocks, setBlocks] = useState<IBlock[]>([]);
  const blocksRef = useRef(blocks);
  const svgRef = useRef<SVGSVGElement>(null);
  blocksRef.current = blocks;

  useEffect(() => {
    const svgElement = svgRef.current as SVGSVGElement;
    let mousedown = false;
    const prevPosition = { x: 0, y: 0 };
    let foreignObject: SVGForeignObjectElement;

    function onMousedown(e: MouseEvent) {
      const element = e.target as Element;

      if (element !== svgElement && element.tagName !== 'image') return;

      mousedown = true;
      prevPosition.x = e.pageX;
      prevPosition.y = e.pageY;

      foreignObject = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'foreignObject',
      );

      foreignObject.setAttribute('width', '0');
      foreignObject.setAttribute('height', '0');

      foreignObject.setAttribute('x', String(e.pageX));
      foreignObject.setAttribute(
        'y',
        String(e.pageY - svgElement.getBoundingClientRect().top),
      );

      foreignObject.style.border = '2px solid';

      svgElement.appendChild(foreignObject);
    }

    function onMousemove(e: MouseEvent) {
      if (!mousedown) return;

      const dx = e.pageX - prevPosition.x;
      const dy = e.pageY - prevPosition.y;

      const { width, height } = getForeignObjectSize(foreignObject);

      foreignObject.setAttribute('width', String(width + dx));
      foreignObject.setAttribute('height', String(height + dy));

      prevPosition.x = e.pageX;
      prevPosition.y = e.pageY;
    }

    function handleFilterColor(arr: RainbowHex[]) {
      const newArr = arr.filter((e, i, self) => self.indexOf(e) !== i);

      if (newArr.length > 7) return handleFilterColor(newArr);

      if (newArr.length === 7) return [];

      return newArr;
    }

    function onMouseup() {
      if (!mousedown) return;
      mousedown = false;

      if (
        foreignObject.width.baseVal.value !== 0 &&
        foreignObject.height.baseVal.value !== 0
      ) {
        const _colors = blocksRef.current.map((block) => block.color);

        const colors =
          _colors.length >= 7 ? handleFilterColor(_colors) : _colors;

        const _color = rainbowHex.find((color) => {
          return !colors.includes(color);
        });

        setBlocks((prev) => {
          return prev.concat({
            text: '',
            position: {
              x: foreignObject.x.baseVal.value,
              y: foreignObject.y.baseVal.value,
            },
            size: {
              width: foreignObject.width.baseVal.value,
              height: foreignObject.height.baseVal.value,
            },
            windowNum: 0,
            id: uuid(),
            color: _color as RainbowHex,
            windows: [],
          });
        });
      }

      foreignObject.remove();

      prevPosition.x = 0;
      prevPosition.y = 0;
    }

    svgElement.addEventListener('mousedown', onMousedown, { passive: false });
    svgElement.addEventListener('mousemove', onMousemove, { passive: false });
    svgElement.addEventListener('mouseup', onMouseup, { passive: false });

    return () => {
      svgElement.removeEventListener('mousedown', onMousedown);
      svgElement.removeEventListener('mousemove', onMousemove);
      svgElement.removeEventListener('mouseup', onMouseup);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(blocks);
  return (
    <div className="sh-[100svh]">
      <svg ref={svgRef} className="border" width="1600" height="900">
        <MemoSvgImage />
        {blocks.map((e, i) => {
          return (
            <Fragment key={e.id}>
              <MemoBlock key={e.id} order={i} setBlocks={setBlocks} {...e} />
              {e.windows.length > 0 &&
                e.windows.map((_window) => {
                  return (
                    <MemoBlock
                      key={_window.id}
                      order={i}
                      setBlocks={setBlocks}
                      {..._window}
                      isWindow={true}
                    />
                  );
                })}
            </Fragment>
          );
        })}
      </svg>
    </div>
  );
}
