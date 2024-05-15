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

  const parser = new DOMParser();

  const originSvg = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" viewBox="0 0 24 24"><path fill="#292D32" d="M20.6 8.4c-1-4.6-5-6.7-8.6-6.7a8.6 8.6 0 0 0-8.6 6.7c-1.2 5.2 2 9.6 4.8 12.3a5.4 5.4 0 0 0 7.6 0c2.8-2.7 6-7 4.8-12.3Zm-8.6 5a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.3Z"/></svg>`,
    "image/svg+xml"
  ).documentElement;

  const destinationSvg = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" style="transform: translateX(8px)" width="36" viewBox="0 0 24 24"><path fill="#292D32" d="m15.2 7.2-8-3.5v-1c0-.4-.3-.7-.8-.7-.4 0-.7.3-.7.8v18.4c0 .5.3.8.7.8.5 0 .8-.3.8-.8v-4l8.2-4c1.7-.8 2.6-2 2.5-3.1 0-1.2-1-2.2-2.7-3Z"/></svg>`,
    "image/svg+xml"
  ).documentElement;

  const svgs = {
    origin: originSvg,
    destination: destinationSvg,
  };

  const setMarker = (type: "origin" | "destination", position: Position) => {
    if (marker[type]?.map) {
      marker[type]!.position = position;
    } else {
      marker[type] = new AdvancedMarkerElement({
        position: position,
        map,
        content: svgs[type],
      });

      console.log(marker[type]);
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
