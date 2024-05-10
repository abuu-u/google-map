import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_API_KEY;

const center = {
  lat: 41.2995,
  lng: 69.2401,
};

const loader = new Loader({
  apiKey: API_KEY,
});

export type Position = {
  lat: number;
  lng: number;
};

export type OnChange = (data: {
  origin?: Position;
  destination?: Position;
}) => void;

export const initMap = async (el: HTMLElement) => {
  const { Map } = await loader.importLibrary("maps");
  let onChange: OnChange;

  const map = new Map(el, {
    center,
    zoom: 12,
    mapId: "DEMO_MAP_ID",
  });

  const { DirectionsRenderer, DirectionsService } = await loader.importLibrary(
    "routes"
  );

  const services = new DirectionsService();
  const renderer = new DirectionsRenderer({
    draggable: true,
    map,
  });

  renderer.addListener("directions_changed", () => {
    const directions = renderer.getDirections();

    if (!directions || !onChange) return;

    const { start_location, end_location } = directions.routes[0].legs[0];

    onChange({
      origin: {
        lat: start_location.lat(),
        lng: start_location.lng(),
      },
      destination: {
        lat: end_location.lat(),
        lng: end_location.lng(),
      },
    });
  });

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  let marker: google.maps.marker.AdvancedMarkerElement;
  let cords: { lat: number; lng: number }[] = [];

  const drawDirection = () => {
    if (cords.length === 2) {
      services.route(
        {
          origin: cords[0],
          destination: cords[1],
          // @ts-expect-error dumb enum
          travelMode: "DRIVING",
        },
        (res, status) => {
          if (status === "OK") {
            marker.map = null;
            renderer.setDirections(res);
          }
        }
      );

      onChange?.({ origin: cords[0], destination: cords[1] });
    } else {
      marker = new AdvancedMarkerElement({
        position: cords[0],
        map,
      });

      onChange?.({ origin: cords[0] });
    }
  };

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (cords.length === 2) return cords;

    const firstCord = cords[0];
    const currCord = {
      lat: e.latLng?.lat() ?? 0,
      lng: e.latLng?.lng() ?? 0,
    };

    cords = firstCord ? [firstCord, currCord] : [currCord];

    drawDirection();
  };

  map.addListener("click", handleClick);

  const setOrigin = ({ lat, lng }: Position) => {
    cords[0] = { lat, lng };
    drawDirection();
  };

  const setDestination = ({ lat, lng }: Position) => {
    cords[1] = { lat, lng };
    drawDirection();
  };

  const setOnChange = (fn: OnChange) => {
    onChange = fn;
  };

  return {
    setOrigin,
    setDestination,
    setOnChange,
  };
};
