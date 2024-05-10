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

  useEffect(() => {
    if (!ref.current) return;

    initMap(ref.current).then(
      ({ setOrigin, setDestination, select, setOnChange, setOnFinish }) => {
        setOriginRef.current = setOrigin;
        setDestinationRef.current = setDestination;
        setSelectRef.current = select;
        setOnChangeRef.current = setOnChange;
        setOnFinishRef.current = setOnFinish;

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

  return <div style={style} className={className} ref={ref}></div>;
};

export default Map;
