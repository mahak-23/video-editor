"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useDropzone } from "react-dropzone";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

import {
  setVideo,
  resetVideo,
  setThumbnail,
  setTrimmedVideo,
} from "@/store/videoSlice";

import * as helpers from "../helper";

import RangeInput from "../components/layout/RangeInput";
import Waveform from "@/components/layout/Waveform";

const ffmpeg = new FFmpeg({ log: true });

export default function HomePage() {
  const dispatch = useDispatch();
  const videoUrl = useSelector((state) => state.video.url);
  const trimmedUrl = useSelector((state) => state.video.trimmedUrl);

  const [inputVideoFile, setInputVideoFile] = useState(null);
  const [ready, setReady] = useState(false);
  const [rStart, setRstart] = useState(0); // 0%
  const [rEnd, setRend] = useState(10); // 10%
  const [thumbnails, setThumbnails] = useState([]);
  const [thumbnailIsProcessing, setThumbnailIsProcessing] = useState(false);
  const [trimIsProcessing, setTrimIsProcessing] = useState(false);
  const [videoMeta, setVideoMeta] = useState(null);

  const videoRef = useRef(null);

  // Load FFmpeg automatically when component mounts
  useEffect(() => {
    const loadFFmpeg = async () => {
      await ffmpeg.load();
      setReady(true);
    };
    loadFFmpeg();
  }, []);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  }, [videoUrl]);

  // Handle file drop
  const onDrop = async (acceptedFiles) => {
    handleReset();

    const file = acceptedFiles[0];
    if (!file) return;
    setInputVideoFile(file);

    const url = URL.createObjectURL(file);
    dispatch(setVideo({ url }));

    await ffmpeg.writeFile("input.mp4", await fetchFile(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
  });

  const handleUpdateRange = (func) => {
    return ({ target: { value } }) => {
      func(value);
    };
  };

  const getThumbnails = async ({ duration }) => {
    setThumbnailIsProcessing(true);

    let MAX_NUMBER_OF_IMAGES = 15;
    let NUMBER_OF_IMAGES = duration < MAX_NUMBER_OF_IMAGES ? duration : 15;

    let offset =
      duration === MAX_NUMBER_OF_IMAGES ? 1 : duration / NUMBER_OF_IMAGES;

    await ffmpeg.writeFile(
      inputVideoFile.name,
      await fetchFile(inputVideoFile)
    );

    const arrayOfImageURIs = [];

    for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
      let startTimeInSecs = helpers.toTimeString(Math.round(i * offset));
      if (startTimeInSecs + offset > duration && offset > 1) {
        offset = 0;
      }
      try {
        await ffmpeg.exec([
          "-ss",
          startTimeInSecs,
          "-i",
          inputVideoFile.name,
          "-frames:v",
          "1",
          "-vf",
          "scale=150:-1",
          `img${i}.png`,
        ]);
        const data = await ffmpeg.readFile(`img${i}.png`);
        let blob = new Blob([data.buffer], { type: "image/png" });
        let dataURI = await helpers.readFileAsBase64(blob);
        arrayOfImageURIs.push(dataURI);

        await ffmpeg.deleteFile(`img${i}.png`);
      } catch (error) {
        console.log({ message: error });
      }
    }
    setThumbnailIsProcessing(false);
    return arrayOfImageURIs;
  };

  const handleLoadedData = async (e) => {
    const el = e.target;
    const meta = {
      name: inputVideoFile.name,
      duration: el.duration,
      videoWidth: el.videoWidth,
      videoHeight: el.videoHeight,
    };
    setVideoMeta(meta);

    const thumbnails = await getThumbnails(meta);
    setThumbnails(thumbnails);
  };

  const handleTrim = async () => {
    setTrimIsProcessing(true);
    let startTime = ((rStart / 100) * videoMeta.duration).toFixed(2);
    let offset = ((rEnd / 100) * videoMeta.duration - startTime).toFixed(2);

    try {
      await ffmpeg.writeFile(
        inputVideoFile.name,
        await fetchFile(inputVideoFile)
      );

      await ffmpeg.exec([
        "-ss",
        helpers.toTimeString(startTime),
        "-i",
        inputVideoFile.name,
        "-t",
        helpers.toTimeString(offset),
        "-c:v",
        "copy",
        "output.mp4",
      ]);
      const trimmedData = await ffmpeg.readFile("output.mp4");
      const trimmedBlob = new Blob([trimmedData.buffer], { type: "video/mp4" });
      const trimmedUrl = URL.createObjectURL(trimmedBlob);

      dispatch(setTrimmedVideo({ trimmedUrl }));

      await ffmpeg.deleteFile(inputVideoFile.name);
      await ffmpeg.deleteFile("output.mp4");
    } catch (error) {
      console.log(error);
    } finally {
      setTrimIsProcessing(false);
    }
  };

  const handleReset = () => {
    dispatch(resetVideo());
    setInputVideoFile(null);
    setRstart(0);
    setRend(10);
    setThumbnails([]);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 max-w-[100vw] mx-auto">
      {!ready ? (
        <p className="text-center">Loading Video Editor...</p>
      ) : (
        <>
          {/* Upload + Small Preview */}
          <div className="flex gap-8 w-full items-center">
            <div className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center max-w-[70%] min-h-[220px] flex items-center justify-center">
              <div {...getRootProps()} className="cursor-pointer w-full">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-gray-600 text-lg font-semibold">
                    Drop the video here...
                  </p>
                ) : (
                  <p className="text-gray-500 text-lg font-medium">
                    Drag & Drop a video file here, or click to select
                  </p>
                )}
              </div>
            </div>

            <div className="w-[30%] h-[220px] bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="h-full w-full object-contain rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553 2.276A1 1 0 0120 13.118v1.764a1 1 0 01-.447.842L15 18v-8zm-6 0v8l-4.553-2.276A1 1 0 014 14.882v-1.764a1 1 0 01.447-.842L9 10z"
                    />
                  </svg>
                  <p className="text-sm">No Video Uploaded</p>
                </div>
              )}
            </div>
          </div>

          {videoUrl && (
            <>
              <div className="rounded-lg overflow-hidden shadow-lg bg-white">
                <h3 className="text-lg font-semibold mb-2">Video</h3>
                <video
                  ref={videoRef}
                  controls
                  src={videoUrl}
                  onLoadedMetadata={handleLoadedData}
                  className="w-full max-h-[500px]"
                />
              </div>

              <div className="bg-white p-2 rounded-md shadow-md my-4">
                <Waveform
                  videoUrl={videoUrl}
                  inputVideoFile={inputVideoFile}
                  videoRef={videoRef}
                />
              </div>
              {/* Timeline + Thumbnails */}
              <>
                <RangeInput
                  rEnd={rEnd}
                  rStart={rStart}
                  handleUpdaterStart={handleUpdateRange(setRstart)}
                  handleUpdaterEnd={handleUpdateRange(setRend)}
                  loading={thumbnailIsProcessing}
                  videoMeta={videoMeta}
                  thumbNails={thumbnails}
                />
              </>

              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleTrim}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                  disabled={trimIsProcessing}
                >
                  {trimIsProcessing ? "trimming..." : "trim selected"}
                </button>

                <button
                  onClick={() => helpers.download(videoUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  disabled={!videoUrl}
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
              {/* Trimmed Video Preview */}
              {trimmedUrl && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">
                    Trimmed Video Preview
                  </h3>
                  <video
                    src={trimmedUrl}
                    controls
                    className="w-full max-h-[300px] rounded-md"
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
