import { useEffect, useRef, useState } from 'react';
import { Block, IBlock } from './components/Block';
import { uuid } from '../utils/uuid';
import { RainbowHex, rainbowHex } from '../utils/constant';

function App() {
  const [blocks, setBlocks] = useState<IBlock[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  // const width = window.innerWidth;
  // const height = window.innerHeight;
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const colorIndex = useRef(0);
  const alreadyAdd = useRef(false);
  console.log(blocks);
  useEffect(() => {
    if (blocks.length === 0) return;
    if (!alreadyAdd.current) return;

    colorIndex.current++;

    return () => {
      alreadyAdd.current = true;
    };
    // const colors = blocks.map((e) => e.colorIndex);

    // const nextIndex = rainbowHex.findIndex((_, i) => {
    //   return !colors.includes(i);
    // });

    // colorIndex.current = nextIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length]);

  useEffect(() => {
    const src = new URL('/assets/house.jpeg', import.meta.url).href;

    const img = new Image();

    img.onload = () => {
      setImgSize({
        width: img.width / 3,
        height: img.height / 3,
      });
    };

    img.src = src;
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current as SVGSVGElement;
    let mousedown = false;
    const prevPosition = { x: 0, y: 0 };
    let foreignObject: SVGForeignObjectElement;

    function onMousedown(e: MouseEvent) {
      const element = e.target as Element;

      if (element !== svgElement && element.tagName !== 'image') return;

      mousedown = true;
      prevPosition.x = e.clientX;
      prevPosition.y = e.clientY;

      foreignObject = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'foreignObject',
      );

      foreignObject.setAttribute('width', '0');
      foreignObject.setAttribute('height', '0');

      foreignObject.setAttribute('x', String(e.clientX));
      foreignObject.setAttribute(
        'y',
        String(e.clientY - svgElement.getBoundingClientRect().top),
      );

      foreignObject.style.border = '2px solid';

      svgElement.appendChild(foreignObject);
    }

    function onMousemove(e: MouseEvent) {
      if (!mousedown) return;

      const dx = e.clientX - prevPosition.x;
      const dy = e.clientY - prevPosition.y;

      foreignObject.setAttribute(
        'width',
        String(foreignObject.width.baseVal.value + dx),
      );
      foreignObject.setAttribute(
        'height',
        String(foreignObject.height.baseVal.value + dy),
      );

      prevPosition.x = e.clientX;
      prevPosition.y = e.clientY;
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
        const _colors = blocks.map((block) => block.color);

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
  }, [blocks.length]);

  const imgUrl = new URL('/assets/house.jpeg', import.meta.url).href;

  return (
    <div className="sh-[100svh]">
      <svg ref={svgRef} className="border" width="1600" height="900">
        {imgSize && (
          <image
            x={(1600 - imgSize.width) / 2}
            y={(900 - imgSize.height) / 2}
            href={imgUrl}
            width={imgSize.width}
            height={imgSize.height}
          />
        )}
        {blocks.map((e, i) => (
          <Block
            key={e.id}
            order={i}
            setBlocks={setBlocks}
            position={e.position}
            text={e.text}
            size={e.size}
            windowNum={e.windowNum}
            id={e.id}
            color={e.color}
          />
        ))}
      </svg>
    </div>
  );
}

export default App;
