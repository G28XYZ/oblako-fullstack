import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";

const getUsers = createAsyncThunk("main/users", async () => {
  const response = await api.getUsers();
  return response.data;
});

const onUpdateUser = createAsyncThunk("main/updateUser", async ({ userId, data }) => {
  const response = await api.onUpdateUser(userId, data);
  return response.data;
});

const onDeleteUsers = createAsyncThunk("main/deleteUsers", async (userIds) => {
  const response = await api.onDeleteUsers(userIds);
  return response.data;
});

export const mainSlice = createSlice({
  name: "main",
  initialState: {
    users: [],
  },
  reducers: {
    clearUsers(state) {
      state.users = [];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getUsers.fulfilled, (state, { payload }) => {
        if (payload) {
          state.users = payload;
        }
      })
      .addCase(onUpdateUser.fulfilled, (state, { payload: users }) => {
        state.users = users;
      })
      .addCase(onDeleteUsers.fulfilled, (state, { payload: users }) => {
        state.users = users;
      });
  },
});

mainSlice.actions = { ...mainSlice.actions, getUsers, onUpdateUser, onDeleteUsers };
