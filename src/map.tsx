import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import { Position, initMap } from "./init-map";

interface Properties {
  style?: CSSProperties;
  className?: string;
  origin?: Position;
  destination?: Position;
}

const Map: FC<Properties> = ({ style, className, origin, destination }) => {
  const ref = useRef<HTMLDivElement>(null);
  const setOriginRef = useRef<(pos: Position) => void>();
  const setDestinationRef = useRef<(pos: Position) => void>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    initMap(ref.current, (data) => console.log(data)).then(
      ({ setOrigin, setDestination }) => {
        setOriginRef.current = setOrigin;
        setDestinationRef.current = setDestination;

        setReady(true);
      }
    );
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (origin) setOriginRef.current?.(origin);

    if (destination) setDestinationRef.current?.(destination);
  }, [destination, origin, ready]);

  return <div style={style} className={className} ref={ref}></div>;
};

export default Map;
