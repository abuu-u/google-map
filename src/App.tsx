import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const API_KEY = "AIzaSyD07A5e4aHqhRZYh0Z-YFb_hwjp7D26CCo";

const center = {
  lat: 41.2995,
  lng: 69.2401,
};

function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
  });

  const ref = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({
    width: "100px",
    height: "100px",
  });

  const resize = () => {
    setSize({
      width: `${ref.current?.clientWidth?.toString() ?? "100"}px`,
      height: `${ref.current?.clientHeight?.toString() ?? "100"}px`,
    });
  };

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const [coordinates, setCoordinates] = useState<
    { lat: number; lng: number }[]
  >([]);

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (coordinates.length === 2) return;

    setCoordinates((cords) => {
      const firstCord = cords[0];
      const currCord = {
        lat: e.latLng?.lat() ?? 0,
        lng: e.latLng?.lng() ?? 0,
      };

      return firstCord ? [firstCord, currCord] : [currCord];
    });
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
      ref={ref}
    >
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{
            ...size,
          }}
          center={center}
          zoom={10}
          onClick={handleClick}
        >
          {coordinates.length === 1 && !directions && (
            <Marker position={coordinates[0]} />
          )}

          {coordinates.length === 2 && !directions && (
            <DirectionsService
              callback={(res, status) => {
                status === google.maps.DirectionsStatus.OK &&
                  setDirections(res);

                console.log(res);
              }}
              options={{
                origin: coordinates[0],
                destination: coordinates[1],
                travelMode: google.maps.TravelMode.DRIVING,
              }}
            />
          )}

          {!!directions && (
            <DirectionsRenderer
              options={{
                draggable: true,
                directions,
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
