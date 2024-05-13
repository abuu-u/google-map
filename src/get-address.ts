import { API_KEY, Position } from "./init-map";

export const getAddress = ({ lat, lng }: Position) => {
  return fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}&result_type=street_address|route`
  )
    .then((res) => res.json())
    .then((data) => data?.results?.[0]?.formatted_address) as Promise<
    string | undefined
  >;
};
