import { useEffect, useRef } from "react";
import { initMap } from "./init-map";

function App() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    initMap(ref.current);
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
