import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  url: null,
  trimmedUrl: null,
  thumbnail: null,
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setVideo: (state, action) => {
      state.url = action.payload.url;
    },
    resetVideo: (state) => {
      state.url = null;
      state.trimmedUrl = null;
    },
    setTrimmedVideo: (state, action) => {
      state.trimmedUrl = action.payload.trimmedUrl;
    },
    setThumbnail: (state, action) => {
      state.thumbnail = action.payload.thumbnail;
    },
  },
});

export const { setVideo, resetVideo, setTrimmedVideo, setThumbnail } =
  videoSlice.actions;
export default videoSlice.reducer;
