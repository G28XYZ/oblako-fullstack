import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import { isEmail, latinValue, maxLength, minLength, required, specSymbol, validator } from "../../utils/validator";
import { AUTH_TOKEN_NAME } from "../../utils/constants";

const getMe = createAsyncThunk("user/me", async () => {
  if (api.getToken()) {
    const response = await api.getMe();
    return response.data;
  }
});

const onLogin = createAsyncThunk("user/login", async (payload) => {
  console.log(payload);
  if (payload) {
    const response = await api.onLogin(payload);
    return response.data;
  }
});

const onRegister = createAsyncThunk("user/register", async (payload) => {
  console.log(payload);
  if (payload) {
    const response = await api.onRegister(payload);
    return response.data;
  }
});

export const userSlice = createSlice({
  name: "user",
  initialState: {
    loggedIn: Boolean(false),
    isAdmin: false,
    dataFields: {
      username: String(""),
      password: String(""),
      email: String(""),
    },

    errors: {
      username: String(""),
      password: String(""),
      email: String(""),
    },

    hasErrors: true,
  },
  reducers: {
    setUsername(state, { payload }) {
      state.dataFields.username = payload;
      state.errors.username = validator(
        state.dataFields.username,
        required(),
        latinValue(),
        minLength(4),
        maxLength(20)
      );
    },
    setPassword(state, { payload }) {
      state.dataFields.password = payload;
      state.errors.password = validator(
        state.dataFields.password,
        required(),
        minLength(6),
        specSymbol(),
        (value) => /[\d]/g.test(value) || "Значение должно содержать хотя бы одну цифру.",
        (value) => /[A-Z]/g.test(value) || "Значение должно содержать хотя бы одну заглавную букву."
      );
    },
    setEmail(state, { payload }) {
      state.dataFields.email = payload;
      state.errors.email = validator(state.dataFields.email, required(), isEmail());
    },
    setHasErrors(state, { payload }) {
      state.hasErrors = payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getMe.fulfilled, (state, { payload }) => {
        if (payload) {
          state.dataFields.username = payload.username;
          state.dataFields.email = payload.email;
          state.loggedIn = true;
          state.isAdmin = payload.role === "admin";
        }
      })
      .addCase(onLogin.fulfilled, (state, { payload }) => {
        const token = payload?.access_token;
        if (token) {
          localStorage.setItem(AUTH_TOKEN_NAME, token);
          api.setToken(token);
          state.loggedIn = true;
        }
      });
  },
});

userSlice.actions = { ...userSlice.actions, getMe, onLogin, onRegister };
