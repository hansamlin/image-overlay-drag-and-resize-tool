import { useEffect, useRef, useState } from 'react';
import { Block, IBlock } from './components/Block';

const pendingClassName = 'ispending';

function App() {
  const [blocks, setBlocks] = useState<IBlock[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const pendingRef = useRef(false);
  const width = window.innerWidth;
  const height = window.innerHeight;

  useEffect(() => {
    const svgElement = svgRef.current as SVGSVGElement;
    let mousedown = false;
    const prevPosition = { x: 0, y: 0 };
    let foreignObject: SVGForeignObjectElement;

    function onMousedown(e: MouseEvent) {
      mousedown = true;
      prevPosition.x = e.clientX;
      prevPosition.y = e.clientY;

      if (pendingRef.current) {
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

        foreignObject.setAttribute('stroke', '1');

        foreignObject.style.border = '1px solid';

        svgElement.appendChild(foreignObject);
      }
    }

    function onMousemove(e: MouseEvent) {
      if (!mousedown) return;
      if (pendingRef.current) {
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
    }

    function onMouseup() {
      if (!mousedown) return;
      mousedown = false;

      if (pendingRef.current) {
        if (
          foreignObject.width.baseVal.value !== 0 &&
          foreignObject.height.baseVal.value !== 0
        ) {
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
            });
          });
        }

        foreignObject.remove();

        pendingRef.current = false;

        svgElement.classList.remove(pendingClassName);

        prevPosition.x = 0;
        prevPosition.y = 0;
      }
    }

    svgElement.addEventListener('mousedown', onMousedown, { passive: false });
    svgElement.addEventListener('mousemove', onMousemove, { passive: false });
    svgElement.addEventListener('mouseup', onMouseup, { passive: false });

    return () => {
      svgElement.removeEventListener('mousedown', onMousedown);
      svgElement.removeEventListener('mousemove', onMousemove);
      svgElement.removeEventListener('mouseup', onMouseup);
    };
  }, []);

  const imgUrl = new URL('/assets/house.jpeg', import.meta.url).href;

  return (
    <div className="h-[100svh]">
      <button
        type="button"
        className="rounded-3xl border border-black p-2 mt-1 ml-4"
        onClick={() => {
          pendingRef.current = true;
          const svgElement = svgRef.current as SVGSVGElement;

          svgElement.classList.add(pendingClassName);
        }}
      >
        add block
      </button>
      <svg ref={svgRef} className="border" width="100%" height="90%">
        <image
          x={width * 0.2}
          y={(height * 0.2) / 2}
          href={imgUrl}
          width={height * 0.8}
          height={height * 0.8}
        ></image>
        {blocks.map((e, i) => (
          <Block
            key={i}
            order={i}
            setBlocks={setBlocks}
            position={e.position}
            text={e.text}
            size={e.size}
          />
        ))}
      </svg>
    </div>
  );
}

export default App;
