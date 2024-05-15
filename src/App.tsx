import { useEffect, useRef, useState } from "react";
import { getAddress } from "./get-address";
import { OnChange } from "./init-map";
import Map from "./map";

function App() {
  const [select, setSelect] = useState<"origin" | "destination">();
  const [originName, setOriginName] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const timeout = useRef<number>();

  const createFinishHandler = () => {
    return async ({ origin, destination }: Parameters<OnChange>[0]) => {
      clearTimeout(timeout.current);

      timeout.current = setTimeout(async () => {
        if (origin) {
          const address = await getAddress(origin);
          if (address) setOriginName(address);
        }

        if (destination) {
          const address = await getAddress(destination);
          if (address) setDestinationName(address);
        }
      }, 100);
    };
  };

  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  return (
    <div className="h-svh w-svw grid grid-rows-[1fr,auto]">
      <Map onChange={createFinishHandler()} select={select} />

      {select === undefined ? (
        <div className="grid grid-rows-2 gap-5 p-3">
          <div className="grid grid-cols-[1fr,auto] border rounded-xl border-black">
            <input
              type="text"
              className="border-none bg-transparent p-3 outline-none "
              placeholder="origin"
              value={originName}
            />
            <button
              className="p-3 border-l border-black"
              onClick={() => setSelect("origin")}
            >
              map
            </button>
          </div>

          <div className="grid grid-cols-[1fr,auto] border rounded-xl border-black">
            <input
              type="text"
              className="border-none bg-transparent p-3 outline-none "
              placeholder="destination"
              value={destinationName}
            />
            <button
              className="p-3 border-l border-black"
              onClick={() => setSelect("destination")}
            >
              map
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-rows-2 gap-5 p-3">
          <div>
            <p>{select}</p>

            <p>{select === "destination" ? destinationName : originName}</p>
          </div>

          <button
            className="p-3 w-full rounded-xl border border-black bg-white"
            onClick={() => setSelect(undefined)}
          >
            done
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
