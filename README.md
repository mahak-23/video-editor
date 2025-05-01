# 🎬 Browser-Based Video Editor

This is a frontend-only browser-based video editing platform built using **Next.js (App Router)**, **React**, **Tailwind CSS**, **Redux Toolkit**, **Wavesurfer.js**, and **FFmpeg** (via WebAssembly).

Users can:

- Upload a video
- View waveform visualization
- Select a range to trim
- Preview the trimmed video
- Generate thumbnails
- Download the trimmed result – all in-browser with no server!

---

## 🚀 Features

- Drag-and-drop video upload
- Real-time video preview
- Waveform rendering via `wavesurfer.js`
- Range-based trimming using `ffmpeg.wasm`
- Thumbnail generation
- Preview of both original and trimmed videos
- No backend required – everything runs in-browser

---

## 📦 Tech Stack

- [Next.js (App Router)](https://nextjs.org/docs/app)
- [React](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [WaveSurfer.js](https://wavesurfer-js.org/)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/video-editor.git
cd video-editor
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the development server

```bash
npm run dev
# or
yarn dev

```

Open http://localhost:3000 in your browser to see the editor in action.

---

## 🧩 Project Structure

```pgsql
app/
  page.js                 # Main page component with UI and logic
components/
  layout/
    Header.js
    Waveform.js          # Waveform player using Wavesurfer.js
    RangeInput.js        # Start/End range slider with thumbnails
helper.js               # Utility functions (e.g., download, time formatting)
store/
  videoSlice.js          # Redux slice for video state management
  store.js               # Redux store config

```

---

## 📁 Notes

- FFmpeg is loaded via WebAssembly (can take a few seconds on first use).
- All video processing is done client-side using browser memory (no upload to server).
- Thumbnail generation and trimming may be slower for large files.
- Tested in Chrome and Firefox.
