import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";

const getUsers = createAsyncThunk("main/users", async () => {
  const response = await api.getUsers();
  return response.data;
});

export const mainSlice = createSlice({
  name: "main",
  initialState: {
    users: [],
  },
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getUsers.fulfilled, (state, { payload }) => {
      if (payload) {
        state.users = payload;
      }
    });
  },
});

mainSlice.actions = { ...mainSlice.actions, getUsers };
