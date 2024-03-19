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
  SelectPicker,
  Input,
  FlexboxGrid,
} from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import RemindIcon from "@rsuite/icons/legacy/Remind";
import FileUploadIcon from "@rsuite/icons/FileUpload";
import FileDownloadIcon from "@rsuite/icons/FileDownload";
import TrashIcon from "@rsuite/icons/Trash";
import ImportIcon from "@rsuite/icons/Import";
import WarningRoundIcon from "@rsuite/icons/WarningRound";

import * as dateFns from "date-fns";
import { useActions } from "../../store";
import { RenderEmpty } from "../../components/grid";
import { bytesToMegaBytes } from "../../utils";

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
  const [errorLoadFile, setErrorLoadFile] = useState();

  const { dispatch, actions } = useActions();

  const handleToggleModal = (toggle) => setOpenModal(typeof toggle === "boolean" ? toggle : !openModal);

  const user = useSelector((state) => state.user);

  const { currentUser = user.data } = props;

  const handleClickLoadFile = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.style.display = "none";

    input.click();
    input.addEventListener("change", async () => {
      let reader = new FileReader();

      const [file] = input.files;
      console.log(file);
      if (file && file.size > 27e6) {
        setErrorLoadFile("Af");
      } else {
        const res = await dispatch(actions.storage.onLoadFile({ type: file.type, name: file.name, size: file.size }));
        console.log(res);
      }

      input.remove();
    });
  };

  return (
    <>
      <Modal
        backdrop={true}
        onClose={() => setErrorLoadFile("")}
        role="alertdialog"
        open={Boolean(errorLoadFile)}
        size="xs"
      >
        <Modal.Header>
          <WarningRoundIcon style={{ color: "red", fontSize: 24, marginRight: 10 }} />
          Ошибка
          <br />
        </Modal.Header>
        <Modal.Body>
          Попробуйте загрузить файл позже.
          <br />
          <br />
          <span>{errorLoadFile}</span>
        </Modal.Body>
        <Modal.Footer>
          <Button size="xs" onClick={() => setErrorLoadFile("")} appearance="subtle">
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
      {currentUser.id === user.data.id && (
        <Button
          startIcon={<ImportIcon />}
          onClick={handleClickLoadFile}
          color="green"
          appearance="ghost"
          style={{ marginBottom: 20 }}
        >
          Загрузить файл
        </Button>
      )}
      <Table virtualized data={currentUser.files} height={400} translate3d={false} renderEmpty={() => <RenderEmpty />}>
        <Column width={70} align="center" fixed>
          <HeaderCell>Скачать</HeaderCell>
          <Cell>
            {(rowData) => (
              <Whisper placement="top" speaker={<Popover>Скачать - {rowData.name}</Popover>}>
                <FileDownloadIcon style={{ color: "green", fontSize: 20, cursor: "pointer" }} />
              </Whisper>
            )}
          </Cell>
        </Column>
        <Column width={200} fixed>
          <HeaderCell>Имя файла</HeaderCell>
          <Cell dataKey="name" />
        </Column>

        <Column width={130}>
          <HeaderCell>Размер, Мб</HeaderCell>
          <Cell>{(rowData) => bytesToMegaBytes(rowData.size)}</Cell>
        </Column>

        <Column width={130}>
          <HeaderCell>Тип файла</HeaderCell>
          <Cell dataKey="type" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>Комментарий</HeaderCell>
          <Cell dataKey="comment" />
        </Column>

        <Column width={150}>
          <HeaderCell>
            <FileUploadIcon style={{ marginRight: 10 }} />
            Дата создания
          </HeaderCell>
          <Cell>{(rowData) => dateFns.format(new Date(rowData.createdAt), "dd.LL.yyyy hh:mm:ss")}</Cell>
        </Column>

        <Column width={150}>
          <HeaderCell>
            <FileDownloadIcon style={{ marginRight: 10 }} />
            Дата скачивания
          </HeaderCell>
          <Cell>{(rowData) => dateFns.format(new Date(rowData.downloadedAt), "dd.LL.yyyy hh:mm:ss")}</Cell>
        </Column>

        {currentUser.id === user.data.id && (
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
        )}
      </Table>
      <EditModal handleToggle={handleToggleModal} open={openModal} data={editData} />
    </>
  );
};

const ControlRow = ({ label, control, ...rest }) => (
  <FlexboxGrid {...rest} style={{ marginBottom: 10 }} align="middle">
    <FlexboxGrid.Item colspan={10}>{label}: </FlexboxGrid.Item>
    <FlexboxGrid.Item colspan={12}>{control}</FlexboxGrid.Item>
  </FlexboxGrid>
);

const EditModal = ({ handleToggle, open, data }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);

  const { dispatch, actions } = useActions();

  const user = useSelector((state) => state.user);

  const handleSave = async () => {
    setIsSavingFile(true);
    const res = await dispatch(actions.storage.onSaveFile({ name: data.name, comment: data.comment }));

    if (res) handleToggle();

    setIsSavingFile(false);
  };

  const handleConfirmDelete = (confirm) => {
    handleToggle(!confirm);
    if (confirm) {
    }
    setConfirmDelete(false);
  };

  return (
    <>
      <Modal
        open={confirmDelete ? false : open}
        onClose={isSavingFile ? undefined : handleToggle}
        size="xs"
        // onEntered={handleEntered}
      >
        <Modal.Header>
          <Modal.Title>Редактирование файла</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data && (
            <div style={{ display: "flex", flexDirection: "column", minHeight: "30vh", gap: 8 }}>
              <ControlRow
                label="Имя"
                control={<Input disabled={isSavingFile} value={data.name} placeholder="Имя файл" />}
              />
              <ControlRow
                label="Комментарий"
                control={
                  <Input
                    disabled={isSavingFile}
                    as="textarea"
                    rows={3}
                    value={data.comment}
                    placeholder="Комментарий"
                  />
                }
              />
              <ControlRow label="Размер файла" control={bytesToMegaBytes(data.size) + " Мб"} />
              <ControlRow label="Тип файла" control={data.type} />
              <ControlRow
                label="Дата создания"
                control={dateFns.format(new Date(data.createdAt), "dd.LL.yyyy hh:mm:ss")}
              />
              <ControlRow
                label="Дата скачивания"
                control={dateFns.format(new Date(data.downloadedAt), "dd.LL.yyyy hh:mm:ss")}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="xs"
            disabled={isSavingFile}
            color="red"
            onClick={() => setConfirmDelete(true)}
            appearance="primary"
            startIcon={<TrashIcon />}
          >
            Удалить файл
          </Button>
          <Button size="xs" loading={isSavingFile} onClick={handleSave} appearance="primary">
            Сохранить
          </Button>
          <Button size="xs" disabled={isSavingFile} onClick={handleToggle} appearance="subtle">
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal backdrop="static" role="alertdialog" open={confirmDelete} size="xs">
        <Modal.Body>
          <RemindIcon style={{ color: "#ffb300", fontSize: 24 }} />
          <br />
          <br />
          Файл будет удален без возможности восстановления.
          <br />
          <br />
          Удалить?
        </Modal.Body>
        <Modal.Footer>
          <Button size="xs" onClick={() => handleConfirmDelete(true)} appearance="primary">
            Удалить
          </Button>
          <Button size="xs" onClick={() => handleConfirmDelete(false)} appearance="subtle">
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
