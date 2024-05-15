import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import { OnChange, OnFinish, Position, initMap } from "./init-map";

interface Properties {
  style?: CSSProperties;
  className?: string;
  origin?: Position;
  destination?: Position;
  select?: "origin" | "destination";
  onChange?: OnChange;
  onFinish?: OnFinish;
}

const Map: FC<Properties> = ({
  style,
  className,
  origin,
  destination,
  select,
  onChange,
  onFinish,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const setOriginRef = useRef<(pos: Position) => void>();
  const setDestinationRef = useRef<(pos: Position) => void>();
  const setSelectRef = useRef<(type?: "origin" | "destination") => void>();
  const setOnChangeRef = useRef<(fn: OnChange) => void>();
  const setOnFinishRef = useRef<(fn: OnFinish) => void>();
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  useState<Record<"origin" | "destination", HTMLElement>>();

  useEffect(() => {
    if (!ref.current) return;

    initMap(ref.current).then(
      ({
        setOrigin,
        setDestination,
        select,
        setOnChange,
        setOnFinish,
        setOnDragStart,
        setOnDragEnd,
      }) => {
        setOriginRef.current = setOrigin;
        setDestinationRef.current = setDestination;
        setSelectRef.current = select;
        setOnChangeRef.current = setOnChange;
        setOnFinishRef.current = setOnFinish;

        setReady(true);
        setOnDragStart(() => setDragging(true));
        setOnDragEnd(() => setDragging(false));
      }
    );
  }, []);

  useEffect(() => {
    if (!ready || !onChange) return;
    setOnChangeRef.current?.(onChange);
  }, [onChange, ready]);

  useEffect(() => {
    if (!ready || !onFinish) return;
    setOnFinishRef.current?.(onFinish);
  }, [onFinish, ready]);

  useEffect(() => {
    if (!ready) return;

    if (origin) setOriginRef.current?.(origin);

    if (destination) setDestinationRef.current?.(destination);
  }, [destination, origin, ready]);

  useEffect(() => {
    if (!ready) return;

    setSelectRef.current?.(select);
  }, [ready, select]);

  const svgClassName = `w-[36px] duration-500 ${
    dragging ? "-translate-y-2.5" : ""
  }`;

  const svgs = {
    origin: (
      <svg className={svgClassName} viewBox="0 0 24 24">
        <path
          fill="#292D32"
          d="M20.6 8.4c-1-4.6-5-6.7-8.6-6.7a8.6 8.6 0 0 0-8.6 6.7c-1.2 5.2 2 9.6 4.8 12.3a5.4 5.4 0 0 0 7.6 0c2.8-2.7 6-7 4.8-12.3Zm-8.6 5a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.3Z"
        />
      </svg>
    ),
    destination: (
      <svg className={`translate-x-2 ${svgClassName}`} viewBox="0 0 24 24">
        <path
          fill="#292D32"
          d="m15.2 7.2-8-3.5v-1c0-.4-.3-.7-.8-.7-.4 0-.7.3-.7.8v18.4c0 .5.3.8.7.8.5 0 .8-.3.8-.8v-4l8.2-4c1.7-.8 2.6-2 2.5-3.1 0-1.2-1-2.2-2.7-3Z"
        />
      </svg>
    ),
  };

  return (
    <div
      style={style}
      className={`relative w-full h-full grid place-items-center ${className}`}
    >
      {!!select && (
        <div className="z-50 absolute -translate-y-1/2">
          {svgs[select]}
          <span className="w-5 h-3 absolute -bottom-0.5 left-1/2 -z-10 -translate-x-1/2 block bg-black/20 rounded-[50%]"></span>
        </div>
      )}

      <div className="w-full h-full" ref={ref}></div>
    </div>
  );
};

export default Map;
