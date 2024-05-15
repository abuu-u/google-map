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
          className={`w-[26px] duration-500 z-50 absolute -translate-y-1/2 ${
            dragging ? "-mt-10" : ""
          }`}
          viewBox="0 0 26 37"
        >
          <g fill="none" fill-rule="evenodd" pointer-events="auto">
            <path
              fill="#C5221F"
              d="M13 0A13 13 0 0 0 0 13c0 7.6 5.6 10.4 9.6 17 2.5 4.3 1.7 7 3.4 7s1-2.7 3.4-6.9C20.1 24 26 20.6 26 13A13 13 0 0 0 13 0Z"
            />
            <path
              fill="#EA4335"
              d="M13 35c-.2 0-.3 0-.7-1.3-.3-1-.8-2.6-2.1-4.6-1.3-2-2.6-3.5-3.9-5-3-3.6-5.3-6.4-5.3-11.5C1 6.2 6.4 1 13 1s12 5.2 12 11.6c0 5.1-2.3 8-5.3 11.5a40.9 40.9 0 0 0-3.8 5c-1.3 2-1.8 3.5-2.2 4.6-.4 1.2-.5 1.3-.7 1.3Z"
            />
            <path fill="#B31412" d="M13 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          </g>
        </svg>
      )}

      <div className="w-full h-full" ref={ref}></div>
    </div>
  );
};

export default Map;
