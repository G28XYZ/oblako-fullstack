import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { appSlice } from "../components/app/reducer";
import { useDispatch } from "react-redux";
import { userSlice } from "../pages/auth";
import { mainSlice } from "../pages/main";
import { checkValidForm } from "../pages/auth/middleware";
import { loadingMiddleware } from "../components/app/middleware";

const slices = {
  appSlice,
  userSlice,
  mainSlice,
};

const actions = {
  ...appSlice.actions,
  ...userSlice.actions,
  ...mainSlice.actions,
};

const rootReducer = combineReducers(
  Object.values(slices).reduce((acc, slice) => ({ ...acc, [slice.name]: slice.reducer }), {})
);

const middlewares = [checkValidForm(actions), loadingMiddleware(actions)];

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middlewares),
});

export const useActions = () => {
  const dispatch = useDispatch();

  return { dispatch, actions };
};
