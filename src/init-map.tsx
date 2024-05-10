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
  const cords: {
    origin?: Position;
    destination?: Position;
  } = {};

  const drawDirection = () => {
    if (cords.origin && cords.destination) {
      services.route(
        {
          origin: cords.origin,
          destination: cords.destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (res, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            marker.map = null;
            renderer.setDirections(res);
          }
        }
      );
    } else {
      marker = new AdvancedMarkerElement({
        position: cords.origin,
        map,
      });
    }

    onChange?.(cords);
  };

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (cords.origin && cords.destination) return cords;

    const currCord = {
      lat: e.latLng?.lat() ?? 0,
      lng: e.latLng?.lng() ?? 0,
    };

    if (cords.origin) {
      cords.destination = currCord;
    } else {
      cords.origin = currCord;
    }

    drawDirection();
  };

  map.addListener("click", handleClick);

  const setOrigin = (origin: Position) => {
    cords.origin = origin;
    drawDirection();
  };

  const setDestination = (destination: Position) => {
    cords.destination = destination;
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
