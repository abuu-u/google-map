import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = "AIzaSyD07A5e4aHqhRZYh0Z-YFb_hwjp7D26CCo";

const center = {
  lat: 41.2995,
  lng: 69.2401,
};

const loader = new Loader({
  apiKey: API_KEY,
});

export const initMap = async (el: HTMLElement) => {
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
  });

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  let marker: google.maps.marker.AdvancedMarkerElement;
  let cords: { lat: number; lng: number }[] = [];

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (cords.length === 2) return cords;

    const firstCord = cords[0];
    const currCord = {
      lat: e.latLng?.lat() ?? 0,
      lng: e.latLng?.lng() ?? 0,
    };

    if (firstCord) {
      services.route(
        {
          origin: firstCord,
          destination: currCord,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (res, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            marker.map = null;
            renderer.setDirections(res);
          }
        }
      );
    } else {
      marker = new AdvancedMarkerElement({
        position: currCord,
        map,
      });
    }

    cords = firstCord ? [firstCord, currCord] : [currCord];
  };

  map.addListener("click", handleClick);
};
