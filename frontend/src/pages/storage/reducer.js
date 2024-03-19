import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";

const onSaveFile = createAsyncThunk("storage/saveFile", async (fileData) => {
  return fileData;
});

const onLoadFile = createAsyncThunk("storage/loadFile", async (fileData) => {
  return fileData;
});

export const storageSlice = createSlice({
  name: "storage",
  initialState: {},
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(onSaveFile.fulfilled, (state, { payload }) => {})
      .addCase(onLoadFile.fulfilled, (state, { payload }) => {});
  },
});

storageSlice.actions = { ...storageSlice.actions, onSaveFile, onLoadFile };
