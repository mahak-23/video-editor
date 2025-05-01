"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useDropzone } from "react-dropzone";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

import { setVideo, setThumbnail, setTrimmedVideo, resetVideo } from "@/store/videoSlice";

const ffmpeg = new FFmpeg({ log: true });

export default function VideoEditor() {
  const dispatch = useDispatch();
  const videoUrl = useSelector((state) => state.video.url);
  const trimmedUrl = useSelector((state) => state.video.trimmedUrl);
  const [ready, setReady] = useState(false);
  const [startTrim, setStartTrim] = useState(0);
  const [endTrim, setEndTrim] = useState(10);
  const [thumbnails, setThumbnails] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      await ffmpeg.load();
      setReady(true);
    };
    loadFFmpeg();
  }, []);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    dispatch(setVideo({ url }));

    await ffmpeg.writeFile("input.mp4", await fetchFile(file));
    await generateThumbnails();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
  });

  const generateThumbnails = async () => {
    try {
      const thumbCount = 5; // you can adjust this
      const thumbs = [];

      for (let i = 1; i <= thumbCount; i++) {
        const outputName = `thumbnail-${i}.png`;
        const seekTime = i * 2; // every 2 seconds or adjust

        await ffmpeg.exec([
          "-i", "input.mp4",
          "-ss", `${seekTime}`,
          "-vframes", "1",
          outputName
        ]);

        const thumbData = await ffmpeg.readFile(outputName);
        const thumbBlob = new Blob([thumbData.buffer], { type: "image/png" });
        const thumbUrl = URL.createObjectURL(thumbBlob);
        thumbs.push(thumbUrl);
      }

      setThumbnails(thumbs);
    } catch (error) {
      console.error("Error generating thumbnails:", error);
    }
  };

  const handleTrim = async () => {
    try {
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-ss", `${startTrim}`,
        "-to", `${endTrim}`,
        "-c", "copy",
        "output.mp4",
      ]);
      const trimmedData = await ffmpeg.readFile("output.mp4");
      const trimmedBlob = new Blob([trimmedData.buffer], { type: "video/mp4" });
      const trimmedUrl = URL.createObjectURL(trimmedBlob);

      dispatch(setTrimmedVideo({ trimmedUrl }));
    } catch (error) {
      console.error("Error trimming video:", error);
    }
  };

  const handleReset = () => {
    dispatch(resetVideo());
    setStartTrim(0);
    setEndTrim(10);
    setThumbnails([]);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = trimmedUrl || videoUrl;
    link.download = "edited-video.mp4";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      {/* Upload + Small Preview */}
      <div className="flex gap-6">
        {/* Upload Zone */}
        <div className="flex-1 border-dashed border-2 border-gray-400 rounded-md p-6 text-center">
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the video here...</p>
            ) : (
              <p>Drag & Drop a video file here, or click to select</p>
            )}
          </div>
        </div>

        {/* Small Preview */}
        {videoUrl && (
          <div className="flex-1">
            <video
              src={videoUrl}
              controls
              className="rounded-lg shadow-lg max-h-[250px] mx-auto"
            />
          </div>
        )}
      </div>

      {/* Full Video Editor */}
      {videoUrl && (
        <>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              controls
              src={videoUrl}
              className="w-full max-h-[500px]"
            />
          </div>

          {/* Timeline + Thumbnails */}
          <div className="flex flex-col gap-4">
            <div className="flex overflow-x-auto gap-2 mt-4">
              {thumbnails.map((thumb, index) => (
                <img
                  key={index}
                  src={thumb}
                  alt={`Thumbnail ${index}`}
                  className="w-32 h-20 object-cover rounded-md"
                />
              ))}
            </div>

            {/* Trimming UI */}
            <div className="flex gap-4 items-center">
              <label>
                Start Time (s):
                <input
                  type="number"
                  value={startTrim}
                  min="0"
                  onChange={(e) => setStartTrim(Number(e.target.value))}
                  className="border p-1 rounded ml-2"
                />
              </label>

              <label>
                End Time (s):
                <input
                  type="number"
                  value={endTrim}
                  min="0"
                  onChange={(e) => setEndTrim(Number(e.target.value))}
                  className="border p-1 rounded ml-2"
                />
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleTrim}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Trim Video
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              disabled={!trimmedUrl && !videoUrl}
            >
              Download Video
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Upload Another Video
            </button>
          </div>
        </>
      )}

      {!ready && <p className="text-center">Loading Video Editor...</p>}
    </div>
  );
}
