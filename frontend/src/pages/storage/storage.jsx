import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
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
  Checkbox,
  Notification,
  useToaster,
  Progress,
} from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import RemindIcon from "@rsuite/icons/legacy/Remind";
import FileUploadIcon from "@rsuite/icons/FileUpload";
import FileDownloadIcon from "@rsuite/icons/FileDownload";
import TrashIcon from "@rsuite/icons/Trash";
import ImportIcon from "@rsuite/icons/Import";
import WarningRoundIcon from "@rsuite/icons/WarningRound";
import CopyIcon from "@rsuite/icons/Copy";

import * as dateFns from "date-fns";
import { useActions } from "../../store";
import { RenderEmpty } from "../../components/grid";
import { bytesToMegaBytes } from "../../utils";
import { Loading } from "../../components/loading";
import { CheckCell } from "../../components/grid/cells";

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
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [deletingFiles, setDeletingFiles] = useState(false);

  const { dispatch, actions } = useActions();
  const toaster = useToaster();

  const user = useSelector((state) => state.user);
  const { file, errorSaveFile, isEditFile } = useSelector((state) => state.storage);

  const { currentUser = user.data } = props;

  const toast = (type, msg) => <Notification type={type} header={msg} />;

  const handleSaveFile = async (confirm) => {
    let isSaved = false;
    if (confirm) {
      if (isEditFile) {
        const res = await dispatch(actions.storage.onSaveFile({ fileData: file, actions }));
        isSaved = errorSaveFile === "";
        return res;
      } else {
        const res = await dispatch(actions.storage.onLoadFile({ fileData: file, actions }));
        isSaved = errorSaveFile === "";
        return res;
      }
    }
    if (!confirm || isSaved) {
      dispatch(actions.storage.setFile({ file: null }));
    }
  };

  const handleCopyFile = async (rowData) => {
    const res = await dispatch(actions.storage.onCopyFile({ fileId: rowData.id, actions }));
    if (res.payload) {
      toaster.push(toast("success", "Скопировано"), { duration: 2000 });
    } else {
      toaster.push(toast("error", "Ошибка"), { duration: 2000 });
    }
  };

  const handleDeleteFiles = async () => {
    setDeletingFiles(true);
    const res = await dispatch(actions.storage.onDeleteManyFiles({ fileIds: checkedKeys, actions }));
    if (res.payload) {
      toaster.push(toast("success", "Выбранные файлы удалены"), { duration: 2000 });
      setCheckedKeys([]);
    } else {
      toaster.push(toast("error", "Ошибка"), { duration: 2000 });
    }
    setDeletingFiles(false);
  };

  const handleDownloadFile = async (rowData) => {
    await dispatch(actions.storage.onDownloadFile({ fileId: rowData.id, actions }));
  };

  let checked = false;
  let indeterminate = false;

  if (checkedKeys.length && checkedKeys.length === currentUser.files.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  } else if (checkedKeys.length > 0 && checkedKeys.length < currentUser.files.length) {
    indeterminate = true;
  }

  const handleCheckAll = (_value, checked) => {
    const keys = checked ? currentUser.files.map((item) => item.id) : [];
    setCheckedKeys(keys);
  };

  const handleCheck = (value, checked) => {
    const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item) => item !== value);
    setCheckedKeys(keys);
  };

  if (!currentUser) {
    return <Loading />;
  }

  return (
    <>
      <Modal
        backdrop={true}
        onClose={() => setErrorLoadFile("")}
        role="alertdialog"
        open={Boolean(errorSaveFile)}
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
          <span>{errorSaveFile}</span>
        </Modal.Body>
        <Modal.Footer>
          <Button size="xs" onClick={() => dispatch(actions.storage.setErrorLoadFile(""))} appearance="subtle">
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
      <div style={{ display: "flex", marginBottom: 20, gap: 20, alignItems: "end" }}>
        <div style={{ width: 80 }}>
          <Progress.Circle
            percent={parseInt(bytesToMegaBytes(currentUser.files.reduce((sum, e) => sum + e.size, 0)), 10)}
            showInfo
          />
        </div>
        {currentUser?.id === user.data?.id && (
          <div>
            <Button
              startIcon={<ImportIcon />}
              onClick={() => dispatch(actions.storage.handleClickLoadFile(actions))}
              color="green"
              appearance="ghost"
            >
              Загрузить файл
            </Button>
          </div>
        )}
        {Boolean(checkedKeys.length) && currentUser?.id === user.data?.id && (
          <div>
            <Button loading={deletingFiles} onClick={handleDeleteFiles} color="red" appearance="ghost">
              Удалить выбранное
            </Button>
          </div>
        )}
      </div>
      <Table
        virtualized
        data={currentUser.files}
        height={Math.max(getHeight(window) - 300, 400)}
        translate3d={false}
        renderEmpty={() => <RenderEmpty />}
      >
        <Column width={30} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        {currentUser?.id === user.data?.id && (
          <Column width={50} fixed>
            <HeaderCell style={{ padding: 0 }}>
              <div style={{ lineHeight: "40px" }}>
                <Checkbox inline checked={checked} indeterminate={indeterminate} onChange={handleCheckAll} />
              </div>
            </HeaderCell>
            <CheckCell dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} disabledId={file?.id} />
          </Column>
        )}

        <Column width={50} align="center" fixed>
          <HeaderCell>Скачать</HeaderCell>
          <Cell>
            {(rowData) => (
              <Whisper placement="top" speaker={<Popover>Скачать - {rowData.name}</Popover>}>
                <FileDownloadIcon
                  onClick={() => handleDownloadFile(rowData)}
                  style={{ color: "green", fontSize: 20, cursor: "pointer" }}
                />
              </Whisper>
            )}
          </Cell>
        </Column>

        {currentUser?.id !== user.data?.id && (
          <Column width={120} align="center" fixed>
            <HeaderCell>Скопировать</HeaderCell>
            <Cell>
              {(rowData) => (
                <Whisper
                  placement="top"
                  speaker={<Popover>Скопировать себе в хранилище файл - {rowData.name}</Popover>}
                >
                  <CopyIcon
                    onClick={() => handleCopyFile(rowData)}
                    style={{ color: "blue", fontSize: 20, cursor: "pointer" }}
                  />
                </Whisper>
              )}
            </Cell>
          </Column>
        )}

        <Column width={150} fixed>
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

        {currentUser?.id === user.data?.id && (
          <Column width={80} fixed="right">
            <HeaderCell>...</HeaderCell>

            <Cell style={{ padding: "6px" }}>
              {(rowData) => (
                <Whisper placement="top" speaker={<Popover>Редактировать</Popover>}>
                  <IconButton
                    size="lg"
                    appearance="link"
                    icon={<EditIcon />}
                    onClick={() => dispatch(actions.storage.setFile({ file: rowData, isEditFile: true }))}
                  />
                </Whisper>
              )}
            </Cell>
          </Column>
        )}
      </Table>
      <EditModal handleCloseModal={handleSaveFile} data={file} isLoadFile={isEditFile === false} />
    </>
  );
};

const ControlRow = ({ label, control, ...rest }) => (
  <FlexboxGrid {...rest} style={{ marginBottom: 10 }} align="middle">
    <FlexboxGrid.Item colspan={10}>{label}: </FlexboxGrid.Item>
    <FlexboxGrid.Item colspan={12}>{control}</FlexboxGrid.Item>
  </FlexboxGrid>
);

const EditModal = ({ handleCloseModal, data, isLoadFile = false }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);

  const { dispatch, actions } = useActions();

  const user = useSelector((state) => state.user);

  const handleSave = async (confirm) => {
    setIsSavingFile(true);
    await handleCloseModal(confirm);
    setIsSavingFile(false);
  };

  const handleConfirmDelete = async (confirm) => {
    if (confirm) {
      const res = await dispatch(actions.storage.onDeleteFile({ fileId: data.id, actions }));
    }
    setConfirmDelete(false);
  };

  const handleChangeValue = (value) => {
    dispatch(actions.storage.onChangeValueFile(value));
  };

  return (
    <>
      <Modal
        open={confirmDelete ? false : Boolean(data)}
        onClose={isSavingFile ? undefined : () => handleCloseModal(false)}
        size="xs"
        // onEntered={handleEntered}
      >
        <Modal.Header>
          <Modal.Title>{isLoadFile ? "Загрузка файла" : "Редактирование файла"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data && (
            <div style={{ display: "flex", flexDirection: "column", minHeight: "30vh", gap: 8 }}>
              <ControlRow
                label="Имя"
                control={
                  <Input
                    onChange={(value) => handleChangeValue({ name: value })}
                    disabled={isSavingFile}
                    value={data.name}
                    placeholder="Имя файл"
                  />
                }
              />
              <ControlRow
                label="Комментарий"
                control={
                  <Input
                    onChange={(value) => handleChangeValue({ comment: value })}
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
              {data.createdAt && (
                <ControlRow
                  control={dateFns.format(new Date(data.createdAt), "dd.LL.yyyy hh:mm:ss")}
                  label="Дата создания"
                />
              )}
              {data.downloadedAt && (
                <ControlRow
                  label="Дата скачивания"
                  control={dateFns.format(new Date(data.downloadedAt), "dd.LL.yyyy hh:mm:ss")}
                />
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!isLoadFile && (
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
          )}
          <Button size="xs" loading={isSavingFile} onClick={() => handleSave(true)} appearance="primary">
            {isLoadFile ? "Загрузить" : "Сохранить"}
          </Button>
          <Button size="xs" disabled={isSavingFile} onClick={() => handleCloseModal(false)} appearance="subtle">
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal backdrop="static" role="alertdialog" open={confirmDelete} size="xs">
        <Modal.Body>
          <RemindIcon style={{ color: "#ffb300", fontSize: 24 }} />
          <br />
          <br />
          Файл '{data?.name}' будет удален без возможности восстановления.
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
