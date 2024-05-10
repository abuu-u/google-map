import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import { OnChange, Position, initMap } from "./init-map";

interface Properties {
  style?: CSSProperties;
  className?: string;
  origin?: Position;
  destination?: Position;
  onChange?: OnChange;
}

const Map: FC<Properties> = ({
  style,
  className,
  origin,
  destination,
  onChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const setOriginRef = useRef<(pos: Position) => void>();
  const setDestinationRef = useRef<(pos: Position) => void>();
  const setOnChangeRef = useRef<(fn: OnChange) => void>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    initMap(ref.current).then(({ setOrigin, setDestination, setOnChange }) => {
      setOriginRef.current = setOrigin;
      setDestinationRef.current = setDestination;
      setOnChangeRef.current = setOnChange;

      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !onChange) return;
    setOnChangeRef.current?.(onChange);
  }, [onChange, ready]);

  useEffect(() => {
    if (!ready) return;

    if (origin) setOriginRef.current?.(origin);

    if (destination) setDestinationRef.current?.(destination);
  }, [destination, origin, ready]);

  return <div style={style} className={className} ref={ref}></div>;
};

export default Map;
