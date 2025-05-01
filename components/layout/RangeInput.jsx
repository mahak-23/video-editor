import * as helpers from "../../helper";

export default function RangeInput({
  thumbNails,
  rEnd,
  rStart,
  handleUpdaterStart,
  handleUpdaterEnd,
  loading,
  videoMeta,
}) {
  const RANGE_MAX = 100;

  if (thumbNails.length === 0 && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center my-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Processing thumbnails...
        </h2>
      </div>
    );
  }

  return (
    <div className="relative my-4 flex justify-center">
      <div className="relative flex items-start border-2 border-green-600 h-20">
        {/* Thumbnails */}
        {thumbNails.map((imgURL, id) => (
          <img
            src={imgURL}
            alt={`thumbnail_${id}`}
            key={id}
            className="h-full w-[70px] object-cover"
          />
        ))}

        {/* Selection Box */}
        <div
          className="absolute top-0 bottom-0 border-4 border-red-500 shadow-md"
          style={{
            width: `calc(${rEnd - rStart}% )`,
            left: `${rStart}%`,
          }}
        >
          {/* Left Handle */}
          <div className="absolute left-0 flex items-center justify-center w-2 h-full bg-red-500 rounded-l-lg -translate-x-[70%] gap-[3px]">
            <div className="w-[3px] h-[60%] bg-gray-100 rounded-full"></div>-{" "}
          </div>
          {/* Right Handle */}
          <div className="absolute right-0 flex items-center justify-center w-2 h-full bg-red-500 rounded-r-lg translate-x-[70%] gap-[3px] flex-row-reverse">
            <div className="w-[3px] h-[60%] bg-gray-100 rounded-full"></div>
          </div>

          {/* Start and End Timestamps */}
          <div className="absolute top-full left-0 transform -translate-x-1/2 translate-y-2 bg-black text-white rounded px-2 py-1 text-xs font-semibold whitespace-nowrap">
            {helpers.toTimeString((rStart / RANGE_MAX) * videoMeta.duration)}
          </div>
          <div className="absolute top-full right-0 transform translate-x-1/2 translate-y-2 bg-black text-white rounded px-2 py-1 text-xs font-semibold whitespace-nowrap">
            {helpers.toTimeString((rEnd / RANGE_MAX) * videoMeta.duration)}
          </div>
        </div>

        {/* Range Inputs */}
        <input
          type="range"
          min={0}
          max={RANGE_MAX}
          value={rStart}
          onChange={handleUpdaterStart}
          className="absolute top-0 left-0 right-0 w-full h-24 opacity-0 cursor-ew-resize appearance-none"
        />
        <input
          type="range"
          min={0}
          max={RANGE_MAX}
          value={rEnd}
          onChange={handleUpdaterEnd}
          className="absolute top-5 left-0 right-0 w-full h-24 opacity-0 cursor-ew-resize appearance-none"
        />
      </div>
    </div>
  );
}
