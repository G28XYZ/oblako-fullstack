import { useState } from "react";
import { useSelector } from "react-redux";
import {
  IconButton,
  Input,
  InputGroup,
  Table,
  Button,
  DOMHelper,
  Progress,
  Checkbox,
  Stack,
  SelectPicker,
  Popover,
  Whisper,
  Modal,
} from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import MoreIcon from "@rsuite/icons/legacy/More";
import ReloadIcon from "@rsuite/icons/Reload";
import { ActionCell, AdminCell, CheckCell, ImageCell, NameCell } from "./cells";
import DrawerView from "./draw-view";
import { useActions } from "../../store";
import { Storage } from "../../pages/storage";
import { RenderEmpty } from "./render-empty";

const { Column, HeaderCell, Cell } = Table;
const { getHeight } = DOMHelper;

export const GridTable = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [rating, setRating] = useState(null);
  const [gridLoading, setGridLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [loadingDeleteButton, setLoadingDeleteButton] = useState(false);

  const { users: data } = useSelector((state) => state.main);

  const user = useSelector((state) => state.user);

  const { dispatch, actions } = useActions();

  let checked = false;
  let indeterminate = false;

  if (checkedKeys.length === data.length - 1) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  } else if (checkedKeys.length > 0 && checkedKeys.length < data.length) {
    indeterminate = true;
  }

  const handleCheckAll = (_value, checked) => {
    const keys = checked
      ? data.map((item) => (item.id !== user.data.id ? item.id : null)).filter((e) => e !== null)
      : [];
    setCheckedKeys(keys);
  };
  const handleCheck = (value, checked) => {
    const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item) => item !== value);
    setCheckedKeys(keys);
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  const factoryData = () => {
    let filtered = data.filter((item) => {
      if (!item.username.includes(searchKeyword)) {
        return false;
      }

      if (rating && item.rating !== rating) {
        return false;
      }

      return true;
    });

    if (sortColumn && sortType) {
      filtered.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];

        if (typeof x === "string") {
          x = x.charCodeAt(0);
        }
        if (typeof y === "string") {
          y = y.charCodeAt(0);
        }

        if (sortType === "asc") {
          return x - y;
        } else {
          return y - x;
        }
      });
    }

    const currentUserIndex = filtered.findIndex((item) => item.id === user.data.id);

    if (currentUserIndex > 0) {
      filtered = [
        filtered[currentUserIndex],
        ...filtered.slice(0, currentUserIndex),
        ...filtered.slice(currentUserIndex + 1),
      ];
    }

    return filtered;
  };

  return (
    <>
      <Stack className="table-toolbar" justifyContent="space-between">
        <Stack style={{ paddingBottom: 12 }} spacing={8}>
          <InputGroup inside>
            <Input placeholder="Поиск" value={searchKeyword} onChange={setSearchKeyword} />
            <InputGroup.Addon>
              <SearchIcon />
            </InputGroup.Addon>
          </InputGroup>
          <Button
            loading={loadingDeleteButton}
            appearance="ghost"
            onClick={async () => {
              setLoadingDeleteButton(true);
              await dispatch(actions.main.onDeleteUsers(checkedKeys));
              setCheckedKeys([]);
              setLoadingDeleteButton(false);
            }}
            disabled={!Boolean(checkedKeys.length)}
          >
            Удалить выбранных
          </Button>
        </Stack>
        <Whisper placement="left" speaker={<Popover>Обновить</Popover>}>
          <IconButton
            onClick={async () => {
              setGridLoading(true);
              await dispatch(actions.main.getUsers());
              setGridLoading(false);
            }}
            color="blue"
            size="xs"
            icon={<ReloadIcon />}
            appearance="ghost"
            circle
          />
        </Whisper>
      </Stack>

      <Table
        height={Math.max(getHeight(window) - 200, 400)}
        data={factoryData()}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
        loading={gridLoading}
        onRowClick={(rowData) => setSelectedRecord(rowData)}
        renderEmpty={() => <RenderEmpty />}
        renderLoading={() => <RenderEmpty />}
      >
        <Column width={50} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={50} fixed>
          <HeaderCell style={{ padding: 0 }}>
            <div style={{ lineHeight: "40px" }}>
              <Checkbox inline checked={checked} indeterminate={indeterminate} onChange={handleCheckAll} />
            </div>
          </HeaderCell>
          <CheckCell dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} currentUser={user.data} />
        </Column>
        <Column width={80} align="center">
          <HeaderCell></HeaderCell>
          <ImageCell dataKey="avatar" />
        </Column>

        <Column width={200} sortable>
          <HeaderCell>Имя</HeaderCell>
          <NameCell dataKey="username" />
        </Column>

        <Column width={200} sortable>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column>

        <Column width={160} sortable>
          <HeaderCell>Количество файлов</HeaderCell>
          <Cell>{(rowData) => rowData.files?.length}</Cell>
        </Column>

        <Column minWidth={230} flexGrow={1} sortable>
          <HeaderCell>Состояние диска</HeaderCell>
          <Cell style={{ padding: "10px 0" }} dataKey="progress">
            {(rowData) => <Progress percent={rowData.progress} showInfo={false} />}
          </Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Роль</HeaderCell>
          <AdminCell dataKey="role" currentUser={user.data} />
        </Column>
      </Table>

      <Modal backdrop="true" open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)} size="lg">
        <Modal.Header>Хранилище - {selectedRecord?.username}</Modal.Header>
        <Modal.Body>{<Storage currentUser={selectedRecord || undefined} />}</Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setSelectedRecord(null)} appearance="subtle">
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <DrawerView open={showDrawer} onClose={() => setShowDrawer(false)} /> */}
    </>
  );
};
