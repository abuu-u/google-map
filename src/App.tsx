import { useState } from "react";
import Map from "./map";

function App() {
  const [select, setSelect] = useState<"origin" | "destination">();

  return (
    <div className="h-screen w-screen relative grid grid-rows-[auto,1fr]">
      <div className="grid grid-cols-2 gap-5 p-3">
        <div className="grid grid-cols-[1fr,auto] border rounded-xl border-black">
          <input
            type="text"
            className="border-none bg-transparent p-3 outline-none "
            placeholder="origin"
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
          />
          <button
            className="p-3 border-l border-black"
            onClick={() => setSelect("destination")}
          >
            map
          </button>
        </div>
      </div>

      <Map onFinish={(pos) => console.log(pos)} select={select} />

      {select !== undefined && (
        <button
          className="absolute p-3 rounded-xl border border-black bg-white bottom-5 left-5 right-5"
          onClick={() => setSelect(undefined)}
        >
          done
        </button>
      )}
    </div>
  );
}

export default App;
