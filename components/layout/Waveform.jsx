"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

export default function Waveform({ videoUrl, inputVideoFile, videoRef }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !videoUrl ||
      !inputVideoFile ||
      !waveformRef.current ||
      !videoRef.current
    )
      return;

    if (wavesurfer.current) {
      wavesurfer.current.destroy();
      wavesurfer.current = null;
    }

    setLoading(true);
    setError("");

    // Create a new WaveSurfer instance
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#cbd5e1",
      progressColor: "#3b82f6",
      height: 80,
      responsive: true,
      barWidth: 2,
      cursorWidth: 2,
      media: videoRef.current, // Use shared videoRef
      interact: true,
      hideScrollbar: true,
      normalize: true,
    });

    const regionsPlugin = RegionsPlugin.create({
      regions: [
        {
          start: 5,
          end: 10,
          color: "rgba(16, 185, 129, 0.3)",
          drag: true,
          resize: true,
        },
      ],
      dragSelection: { slop: 5 },
    });

    wavesurfer.current.registerPlugin(regionsPlugin);

    wavesurfer.current.load(videoUrl);

    wavesurfer.current.on("ready", () => {
      setLoading(false);
      regionsPlugin.enableDragSelection();
    });

    regionsPlugin.on("region-clicked", (region, e) => {
      e.stopPropagation();
      region.play();
    });

    wavesurfer.current.on("error", (err) => {
      if (err.name !== "AbortError") {
        console.error("WaveSurfer error event:", err);
        setError("Failed to load audio. No audio track found.");
        setLoading(false);
      }
    });

    return () => {
      wavesurfer.current?.destroy();
      wavesurfer.current = null;
    };
  }, [videoUrl, inputVideoFile, videoRef]);

  return (
    <div className="w-full">
      {loading && (
        <p className="text-center text-blue-500">Loading waveform...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      <div ref={waveformRef} className="w-full overflow-hidden" />
    </div>
  );
}
