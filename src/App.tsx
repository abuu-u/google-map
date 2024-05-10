import { useState } from "react";
import { Position } from "./init-map";
import Map from "./map";

function App() {
  const [origin, setOrigin] = useState<Position>();

  const handleClick = () =>
    setOrigin({
      lat: 41.2995,
      lng: 69.2401,
    });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      <button
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: "100",
        }}
        onClick={handleClick}
      >
        set
      </button>

      <Map
        style={{
          width: "100%",
          height: "100%",
        }}
        origin={origin}
      />
    </div>
  );
}

export default App;
