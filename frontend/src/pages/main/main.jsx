import { Panel, Stack } from "rsuite";

export const MainPage = () => {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      direction="column"
      style={{
        height: "100vh",
      }}
    >
      <Panel bordered style={{ width: 800 }} header="Main page"></Panel>
    </Stack>
  );
};
