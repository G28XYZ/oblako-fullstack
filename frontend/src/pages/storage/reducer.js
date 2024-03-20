import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import { handleResponse } from "../../utils";

const onSaveFile = createAsyncThunk("storage/saveFile", async ({ fileData, actions }, thunkApi) => {
  if (fileData) {
    const res = await handleResponse(api.onUpdateFile.bind(this, fileData), thunkApi);
    if (res.data) {
      await thunkApi.dispatch(actions.user.getMe());
    }
    return res.data;
  }
});

const onLoadFile = createAsyncThunk("storage/loadFile", async ({ fileData, actions }, thunkApi) => {
  if (fileData) {
    const res = await handleResponse(api.onLoadFile.bind(this, fileData), thunkApi);
    if (res.data) {
      await thunkApi.dispatch(actions.user.getMe());
    }
    return res.data;
  }
});

const onCopyFile = createAsyncThunk("storage/copyFile", async ({ fileId, actions }, thunkApi) => {
  const res = await handleResponse(api.onCopyFile.bind(this, fileId), thunkApi);
  if (res.data) {
    await thunkApi.dispatch(actions.user.getMe());
  }
  return res.data;
});

const onDeleteFile = createAsyncThunk("storage/deleteFile", async ({ fileId, actions }, thunkApi) => {
  const res = await handleResponse(api.onDeleteFile.bind(this, fileId), thunkApi);
  if (res.data) {
    await thunkApi.dispatch(actions.user.getMe());
  }
  return res.data;
});

const onDeleteManyFiles = createAsyncThunk("storage/deleteManyFiles", async ({ fileIds, actions }, thunkApi) => {
  const res = await handleResponse(api.onDeleteManyFiles.bind(this, fileIds), thunkApi);
  if (res.data) {
    await thunkApi.dispatch(actions.user.getMe());
  }
  return res.data;
});

const onDownloadFile = createAsyncThunk("storage/downloadFile", async ({ fileId, actions }, thunkApi) => {
  const res = await handleResponse(api.onDownloadFile.bind(this, fileId), thunkApi);
  if (res.data) {
    const file = res.data;

    const blob = new Blob([JSON.stringify({ "тестовый файл": file })], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `${file.name}.txt`;
    link.href = window.URL.createObjectURL(blob);
    link.onclick = function () {
      setTimeout(() => {
        window.URL.revokeObjectURL(this.href);
      }, 1500);
    };
    link.click();
    link.remove();

    await thunkApi.dispatch(actions.user.getMe());
  }
  return res.data;
});

const handleClickLoadFile = createAsyncThunk("storage/handleClickLoadFile", async (actions, thunkApi) => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.style.display = "none";
  input.click();
  input.addEventListener("change", async () => {
    const [file] = input.files;
    // TODO
    // if (file && file.size > 27e6) {
    // setErrorLoadFile("Файл превышает 25 мб");
    // } else {

    if (file) {
      const newFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        comment: "",
      };
      thunkApi.dispatch(actions.storage.setFile({ file: newFile, isEditFile: false }));
    }
    input.remove();
  });
});

export const storageSlice = createSlice({
  name: "storage",
  initialState: {
    isEditFile: false,
    file: null,
    errorSaveFile: "",
  },
  reducers: {
    setFile(state, { payload }) {
      state.file = payload.file;
      state.isEditFile = Boolean(payload.isEditFile);
    },
    setErrorLoadFile(state, { payload }) {
      state.errorSaveFile = payload;
    },
    onChangeValueFile(state, { payload }) {
      state.file = { ...state.file, ...payload };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(onSaveFile.fulfilled, (state) => {
        state.errorSaveFile = "";
      })
      .addCase(onLoadFile.fulfilled, (state) => {
        state.file = null;
        state.errorSaveFile = "";
      })
      .addCase(onDeleteFile.fulfilled, (state) => {
        state.file = null;
        state.errorSaveFile = "";
      })
      .addCase(onDeleteManyFiles.fulfilled, (state) => {
        state.errorSaveFile = "";
      })
      .addCase(onDownloadFile.fulfilled, (state) => {
        state.errorSaveFile = "";
      })
      .addCase(onDownloadFile.rejected, (state) => {
        state.errorSaveFile = "Ошибка запроса к хранилищу";
      })
      .addCase(onSaveFile.rejected, (state) => {
        state.errorSaveFile = "Ошибка запроса к хранилищу";
      })
      .addCase(onLoadFile.rejected, (state) => {
        state.errorSaveFile = "Ошибка запроса к хранилищу";
      })
      .addCase(onDeleteFile.rejected, (state) => {
        state.errorSaveFile = "Ошибка запроса к хранилищу";
      })
      .addCase(onCopyFile.rejected, (state) => {
        state.errorSaveFile = "Ошибка запроса к хранилищу";
      })
      .addCase(onDeleteManyFiles.rejected, (state) => {
        state.errorSaveFile = "Ошибка запроса к хранилищу";
      });
  },
});

storageSlice.actions = {
  ...storageSlice.actions,
  onSaveFile,
  onLoadFile,
  onDeleteFile,
  handleClickLoadFile,
  onCopyFile,
  onDeleteManyFiles,
  onDownloadFile,
};
