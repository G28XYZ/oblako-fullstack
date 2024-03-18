import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Panel, Stack, Container, Content, Sidebar, Nav, Toggle, Sidenav, Navbar } from "rsuite";
import { useActions } from "../../store";
import { GridTable } from "../../components/grid";
import DashboardIcon from "@rsuite/icons/legacy/Dashboard";
import MagicIcon from "@rsuite/icons/legacy/Magic";
import GearCircleIcon from "@rsuite/icons/legacy/GearCircle";
import ArrowLeftLineIcon from "@rsuite/icons/ArrowLeftLine";
import ArrowRightLineIcon from "@rsuite/icons/ArrowRightLine";
import GroupIcon from "@rsuite/icons/legacy/Group";
import AdminIcon from "@rsuite/icons/Admin";
import SettingHorizontalIcon from "@rsuite/icons/SettingHorizontal";
import { Storage } from "../storage/storage";

const NavHeader = () => {
  const { dispatch, actions } = useActions();
  const {
    data: { username },
    isAdmin,
  } = useSelector((state) => state.user);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: "#f5f5f5",
            borderRadius: "50%",
            marginTop: 2,
            overflow: "hidden",
            display: "inline-block",
          }}
        >
          <img loading="lazy" src={`https://i.pravatar.cc/100`} width="40" />
        </div>
        <span style={{ fontSize: 14 }}>
          {isAdmin ? "admin" : "user"} - {username}
        </span>
      </div>
      <Button
        onClick={() => {
          dispatch(actions.user.onLogout());
          dispatch(actions.user.clearUserData());
          dispatch(actions.main.clearUsers());
        }}
        color="red"
        appearance="ghost"
        size="xs"
      >
        Выйти
      </Button>
    </div>
  );
};

export const MainPage = () => {
  const { users } = useSelector((state) => state.main);

  const { isAdmin } = useSelector((state) => state.user);

  const { dispatch, actions } = useActions();

  useEffect(() => {
    !users.length && dispatch(actions.main.getUsers());
  }, [users]);

  const [expanded, setExpanded] = React.useState(true);
  const [activeKey, setActiveKey] = React.useState(!isAdmin ? "1" : localStorage.getItem("activeKey") || "1");

  useMemo(() => localStorage.setItem("activeKey", activeKey), [activeKey]);

  return (
    <Container style={{ height: "100vh", width: "100vw" }}>
      <Sidebar width={expanded ? 260 : 56} collapsible>
        <Sidenav
          style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100vh" }}
          expanded={expanded}
          // appearance="inverse"
        >
          <Sidenav.Body>
            <Nav activeKey={activeKey} onSelect={setActiveKey}>
              <Nav.Item eventKey={activeKey} icon={<AdminIcon />}>
                <NavHeader />
              </Nav.Item>
              <Nav.Item eventKey="1" icon={<SettingHorizontalIcon />}>
                Хранилище
              </Nav.Item>
              {isAdmin && (
                <Nav.Item eventKey="2" icon={<GroupIcon />}>
                  Список пользователей
                </Nav.Item>
              )}
            </Nav>
          </Sidenav.Body>
          <Sidenav.Toggle onToggle={setExpanded} />
        </Sidenav>
      </Sidebar>

      <Container>
        <Content style={{ padding: 20 }}>
          {activeKey === "1" && <Storage />}
          {isAdmin && activeKey === "2" && <GridTable />}
        </Content>
      </Container>
    </Container>
  );
};
