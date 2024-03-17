import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Panel, Stack } from "rsuite";
import { useActions } from "../../store";
import { GridTable } from "../../components/grid";

export const MainPage = () => {
  const { users } = useSelector((state) => state.main);

  const { dispatch, actions } = useActions();

  useEffect(() => {
    !users.length && dispatch(actions.getUsers());
  }, []);

  return (
    <Panel
      style={{ maxWidth: 1024, width: "100vw" }}
      header={
        <Stack justifyContent="space-between">
          <div style={{ fontSize: 24 }}>Пользователи</div>
          <Button appearance="link" onClick={() => dispatch(actions.onLogout())}>
            Выйти
          </Button>
        </Stack>
      }
    >
      <GridTable />
    </Panel>
  );
};
