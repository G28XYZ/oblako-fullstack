import { useEffect } from "react";
import { useSelector } from "react-redux";
import { CustomProvider, Stack } from "rsuite";

import { useActions } from "../../store";
import { AuthGuard } from "../../guards/auth-guard";
import { Route, Routes } from "react-router-dom";
import { NotFound } from "../../pages";
import { SignIn, SignUp } from "../../pages/auth";
import { PrivateProtected } from "../private-protected";
import { MainPage } from "../../pages/main";
import { Loading } from "../loading";

export function App() {
  const { isLoading } = useSelector((state) => state.app);

  const { dispatch, actions } = useActions();

  useEffect(() => {
    dispatch(actions.getMe());
  }, []);

  return (
    <CustomProvider theme="dark">
      <Stack
        justifyContent="center"
        alignItems="center"
        direction="column"
        style={{
          height: "100vh",
        }}
      >
        <AuthGuard />
        <Routes path="/">
          <Route path="/" element={<Loading />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/" element={<PrivateProtected />}>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Stack>
    </CustomProvider>
  );
}
