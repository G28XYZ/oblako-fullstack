import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import { isEmail, latinValue, maxLength, minLength, required, specSymbol, validator } from "../../utils/validator";
import { AUTH_TOKEN_NAME } from "../../utils/constants";

const handleResponse = async (fn, { rejectWithValue }) => {
  let response;
  try {
    response = await fn();
    if ("errors" in response) {
      throw new Error(JSON.stringify(response?.errors));
    }
    return response;
  } catch (e) {
    return rejectWithValue(response?.errors || e);
  }
};

const getMe = createAsyncThunk("user/me", async (_, thinkApi) => {
  if (api.getToken()) {
    const response = await handleResponse(api.getMe.bind(this), thinkApi);
    return response?.data || response;
  }
});

const onLogin = createAsyncThunk("user/login", async (payload, thinkApi) => {
  if (payload) {
    const response = await handleResponse(api.onLogin.bind(this, payload), thinkApi);
    return response?.data || response;
  }
});

const onRegister = createAsyncThunk("user/register", async (payload, thinkApi) => {
  if (payload) {
    const response = await handleResponse(api.onRegister.bind(this, payload), thinkApi);
    return response?.data || response;
  }
});

export const userSlice = createSlice({
  name: "user",
  initialState: {
    loggedIn: Boolean(false),
    userId: 0,
    isAdmin: false,
    requestErrors: [],
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
    onLogout(state) {
      state.loggedIn = false;
      localStorage.removeItem(AUTH_TOKEN_NAME);
    },
    clearRequestErrors(state) {
      state.requestErrors = [];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getMe.fulfilled, (state, { payload }) => {
        if (payload) {
          state.dataFields.username = payload.username;
          state.dataFields.email = payload.email;
          state.userId = payload.id;
          state.loggedIn = true;
          state.isAdmin = payload.role === "admin";
        }
      })
      .addCase(onRegister.fulfilled, (state, { payload }) => {
        if (payload) {
          const token = payload?.access_token;
          api.setToken(token);
          localStorage.setItem(AUTH_TOKEN_NAME, token);

          state.dataFields.username = payload.username;
          state.dataFields.email = payload.email;
          state.userId = payload.id;
          state.loggedIn = true;
          state.isAdmin = payload.role === "admin";
        }
      })
      .addCase(onRegister.rejected, (state, { payload }) => {
        if (payload?.length) {
          state.requestErrors = payload;
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
