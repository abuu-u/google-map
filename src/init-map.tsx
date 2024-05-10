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

export type OnFinish = (data: {
  origin: Position;
  destination: Position;
}) => void;

export const initMap = async (el: HTMLElement) => {
  const cords: {
    origin?: Position;
    destination?: Position;
  } = {};

  const marker: {
    origin?: google.maps.marker.AdvancedMarkerElement;
    destination?: google.maps.marker.AdvancedMarkerElement;
  } = {};

  let moveListener: google.maps.MapsEventListener;

  let directionBounds: google.maps.LatLngBounds | undefined;

  let onChange: OnChange;
  const setOnChange = (fn: OnChange) => {
    onChange = fn;
  };

  let onFinish: OnFinish;
  const setOnFinish = (fn: OnFinish) => {
    onFinish = fn;
  };

  const { Map } = await loader.importLibrary("maps");

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
    suppressMarkers: true,
    preserveViewport: true,
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
            renderer.setDirections(res);
            directionBounds = res?.routes[0].bounds;
          }
        }
      );
    }

    onChange?.(cords);
  };

  const setOrigin = (origin: Position) => {
    cords.origin = origin;
    drawDirection();
  };

  const setDestination = (destination: Position) => {
    cords.destination = destination;
    drawDirection();
  };

  const setMarker = (type: "origin" | "destination") => {
    const position = {
      lat: map.getCenter()?.lat() ?? 0,
      lng: map.getCenter()?.lng() ?? 0,
    };

    if (marker[type]) {
      marker[type]!.position = position;
    } else {
      marker[type] = new AdvancedMarkerElement({
        position: position,
        map,
      });
    }

    if (type === "origin") {
      setOrigin(position);
    } else if (type === "destination") {
      setDestination(position);
    }
  };

  const select = (type?: "origin" | "destination") => {
    if (!type) {
      if (directionBounds) map.fitBounds(directionBounds);

      if (cords.destination && cords.origin) {
        onFinish({
          origin: cords.origin,
          destination: cords.destination,
        });
      }

      moveListener?.remove();

      return;
    }

    const mapCenter = map.getCenter();
    const latMarker = marker[type]?.position?.lat;
    const lngMarker = marker[type]?.position?.lng;
    const lat =
      typeof latMarker === "function"
        ? latMarker()
        : latMarker ?? mapCenter?.lat() ?? 0;
    const lng =
      typeof lngMarker === "function"
        ? lngMarker()
        : lngMarker ?? mapCenter?.lng() ?? 0;

    map.setCenter({ lat, lng });

    setMarker(type);

    const handleMove = () => {
      setMarker(type);
    };

    moveListener = map.addListener("drag", handleMove);
  };

  return {
    setOrigin,
    setDestination,
    select,
    setOnChange,
    setOnFinish,
  };
};
