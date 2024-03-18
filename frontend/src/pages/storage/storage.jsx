import { useSelector } from "react-redux";
import React, { useState } from "react";
import {
  DOMHelper,
  Table,
  IconButton,
  Popover,
  Whisper,
  ButtonToolbar,
  Button,
  Modal,
  Loader,
  Placeholder,
  InlineEdit,
} from "rsuite";
import EditIcon from "@rsuite/icons/Edit";

const { Column, HeaderCell, Cell } = Table;
const { getHeight } = DOMHelper;

/**
 * file object type
 * name
 * comment
 * size
 * createdAt
 * downloadedAt
 */

/** */
export const Storage = (props) => {
  const [openModal, setOpenModal] = React.useState(false);
  const [editData, setEditData] = useState();

  const handleToggleModal = () => setOpenModal(!openModal);

  const user = useSelector((state) => state.user);

  const { currentUser = user.data } = props;

  return (
    <>
      <Table virtualized height={Math.max(getHeight(window) - 120, 400)} data={currentUser.files} translate3d={false}>
        <Column width={200} align="center" fixed>
          <HeaderCell>Имя файла</HeaderCell>
          <Cell dataKey="name" />
        </Column>

        <Column width={130}>
          <HeaderCell>Размер</HeaderCell>
          <Cell dataKey="size" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>Комментарий</HeaderCell>
          <Cell dataKey="comment" />
        </Column>

        <Column width={150}>
          <HeaderCell>Дата создания</HeaderCell>
          <Cell dataKey="createdAt" />
        </Column>

        <Column width={150}>
          <HeaderCell>Дата скачивания</HeaderCell>
          <Cell dataKey="downloadedAt" />
        </Column>

        <Column width={80} fixed="right">
          <HeaderCell>...</HeaderCell>

          <Cell style={{ padding: "6px" }}>
            {(rowData) => (
              <Whisper placement="top" speaker={<Popover>Редактировать</Popover>}>
                <IconButton
                  size="lg"
                  appearance="link"
                  icon={<EditIcon />}
                  onClick={() => {
                    handleToggleModal();
                    setEditData(rowData);
                  }}
                />
              </Whisper>
            )}
          </Cell>
        </Column>
      </Table>
      <EditModal handleToggle={handleToggleModal} open={openModal} data={editData} />
    </>
  );
};

const EditModal = ({ handleToggle, open, data }) => {
  return (
    <>
      <Modal
        open={open}
        onClose={handleToggle}
        size="md"
        // onEntered={handleEntered}
      >
        <Modal.Header>
          <Modal.Title>Редактирование файла</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data && (
            <div style={{ display: "flex", flexDirection: "column", minHeight: "50vh", gap: 8 }}>
              <InlineEdit value={data.name} width={200} />
              <InlineEdit value={data.comment} width={200} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleToggle} appearance="primary">
            Ok
          </Button>
          <Button onClick={handleToggle} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
