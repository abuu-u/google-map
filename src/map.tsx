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
        setOnDragStart(() => setDragging(true));
        setOnDragEnd(() => setDragging(false));

        setReady(true);
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

  return (
    <div
      style={style}
      className={`relative w-full h-full grid place-items-center ${className}`}
    >
      {!!select && (
        <svg
          className={`w-12 duration-500 z-50 absolute -translate-y-1/2 ${
            dragging ? "-mt-10" : ""
          }`}
          viewBox="0 0 1024 1024"
        >
          <path
            fill="#FF3D00"
            d="M512 85a299 299 0 0 0-299 299c0 165 299 555 299 555s299-390 299-555S677 85 512 85zm0 448a149 149 0 1 1 0-298 149 149 0 0 1 0 298z"
          />
        </svg>
      )}

      <div className="w-full h-full" ref={ref}></div>
    </div>
  );
};

export default Map;
