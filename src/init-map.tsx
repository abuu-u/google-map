import { Loader } from "@googlemaps/js-api-loader";

export const API_KEY = import.meta.env.VITE_API_KEY;

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

  let centerChangedListener: google.maps.MapsEventListener;
  let dragListener: google.maps.MapsEventListener;
  let dragEndListener: google.maps.MapsEventListener;

  let directionBounds: google.maps.LatLngBounds | undefined;

  let onChange: OnChange;
  const setOnChange = (fn: OnChange) => {
    onChange = fn;
  };

  let onFinish: OnFinish;
  const setOnFinish = (fn: OnFinish) => {
    onFinish = fn;
  };

  let onDragStart: () => void;
  const setOnDragStart = (fn: () => void) => {
    onDragStart = fn;
  };

  let onDragEnd: () => void;
  const setOnDragEnd = (fn: () => void) => {
    onDragEnd = fn;
  };

  const { Map } = await loader.importLibrary("maps");

  const map = new Map(el, {
    center,
    zoom: 12,
    mapId: "DEMO_MAP_ID",
    streetViewControl: false,
  });

  const { DirectionsRenderer, DirectionsService } = await loader.importLibrary(
    "routes"
  );

  const services = new DirectionsService();
  const renderer = new DirectionsRenderer({
    map,
    suppressMarkers: true,
    preserveViewport: true,
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

  const setMarker = (type: "origin" | "destination", position: Position) => {
    if (marker[type]?.map) {
      marker[type]!.position = position;
    } else {
      marker[type] = new AdvancedMarkerElement({
        position: position,
        map,
      });
    }
  };

  const select = (type?: "origin" | "destination") => {
    centerChangedListener?.remove();
    dragListener?.remove();
    dragEndListener?.remove();

    if (!type) {
      if (directionBounds) map.fitBounds(directionBounds);

      if (cords.destination && cords.origin) {
        onFinish?.({
          origin: cords.origin,
          destination: cords.destination,
        });
      }

      if (cords.origin) setMarker("origin", cords.origin);
      if (cords.destination) setMarker("destination", cords.destination);

      return;
    }

    const currMarker = marker[type];

    if (currMarker !== undefined) {
      currMarker.map = null;
    }

    const getMapCenter = () => ({
      lat: map.getCenter()?.lat() ?? 0,
      lng: map.getCenter()?.lng() ?? 0,
    });
    const mapCenter = getMapCenter();
    const latMarker = marker[type]?.position?.lat;
    const lngMarker = marker[type]?.position?.lng;
    const lat =
      typeof latMarker === "function"
        ? latMarker()
        : latMarker ?? mapCenter.lat;
    const lng =
      typeof lngMarker === "function"
        ? lngMarker()
        : lngMarker ?? mapCenter.lng;

    map.setCenter({ lat, lng });

    dragListener = map.addListener("dragstart", () => {
      onDragStart?.();
    });

    dragEndListener = map.addListener("dragend", () => {
      onDragEnd?.();
    });

    centerChangedListener = map.addListener("center_changed", () => {
      if (!type) return;

      type === "origin"
        ? setOrigin(getMapCenter())
        : setDestination(getMapCenter());
    });
  };

  return {
    setOrigin,
    setDestination,
    select,
    setOnChange,
    setOnFinish,
    setOnDragStart,
    setOnDragEnd,
  };
};
