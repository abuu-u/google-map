import { useEffect, useRef } from "react";
import { initMap } from "./init-map";

function App() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    initMap(ref.current, (data) => console.log(data)).then(
      ({ setOrigin, setDestination }) => {
        setTimeout(() => {
          setOrigin({
            lat: 41.2995,
            lng: 69.2401,
          });
        }, 5000);
      }
    );
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
      ref={ref}
    ></div>
  );
}

export default App;
