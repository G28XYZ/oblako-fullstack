import { AUTH_TOKEN_NAME } from "../utils/constants";

class Api {
  #baseUrl = BASE_URL;

  #token = localStorage.getItem(AUTH_TOKEN_NAME);

  #urls = {
    login: `${this.#baseUrl}/signin`,
    register: `${this.#baseUrl}/signup`,
    me: `${this.#baseUrl}/me`,
    users: `${this.#baseUrl}/users`,
    updateUser: `${this.#baseUrl}/users/update`,
    deleteUsers: `${this.#baseUrl}/users/delete`,
    loadFile: `${this.#baseUrl}/files/load`,
    updateFile: `${this.#baseUrl}/files/update`,
    deleteFile: `${this.#baseUrl}/files/delete`,
    downloadFile: `${this.#baseUrl}/files/download`,
    copyFile: `${this.#baseUrl}/files/copy`,
  };

  async #handleRequest(response) {
    return response?.json() || Promise.reject({ message: "Error api.handleRequest", response });
  }

  get #headers() {
    let headers = {};
    if (this.#token) {
      headers.authorization = `Bearer ${this.#token}`;
    }
    return headers;
  }

  setToken(token = localStorage.getItem(AUTH_TOKEN_NAME)) {
    this.#token = token;
  }

  getToken() {
    return this.#token;
  }

  getMe = async () => await fetch(this.#urls.me, { headers: this.#headers }).then(this.#handleRequest);

  #createRequest = async (url, method = "GET", body) => {
    const headers = this.#headers;
    body = body ? JSON.stringify(body) : undefined;
    if (method !== "GET") {
      headers["Content-Type"] = "application/json;charset=utf-8";
    }
    return await fetch(url, { body, method, headers }).then(this.#handleRequest);
  };

  onLogin = async (body) => await this.#createRequest(this.#urls.login, "POST", body);

  onRegister = async (body) => await this.#createRequest(this.#urls.register, "POST", body);

  getUsers = async () => await this.#createRequest(this.#urls.users);

  onUpdateUser = async (userId, body) => await this.#createRequest(`${this.#urls.updateUser}/${userId}`, "PUT", body);

  onDeleteUsers = async (userIds = []) => await this.#createRequest(`${this.#urls.deleteUsers}`, "DELETE", userIds);

  onLoadFile = async (fileData) => await this.#createRequest(`${this.#urls.loadFile}`, "POST", fileData);

  onUpdateFile = async (fileData) => await this.#createRequest(`${this.#urls.updateFile}`, "PUT", fileData);

  onDeleteFile = async (fileId) => await this.#createRequest(`${this.#urls.deleteFile}/${fileId}`, "DELETE");

  onDeleteManyFiles = async (fileIds) => await this.#createRequest(`${this.#urls.deleteFile}`, "DELETE", fileIds);

  onDownloadFile = async (fileId) => await this.#createRequest(`${this.#urls.downloadFile}/${fileId}`);

  onCopyFile = async (fileId) => await this.#createRequest(`${this.#urls.copyFile}/${fileId}`);
}

export const api = new Api();
