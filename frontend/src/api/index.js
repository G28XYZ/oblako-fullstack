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

  onLogin = async (body) =>
    await fetch(this.#urls.login, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { ...this.#headers, "Content-Type": "application/json;charset=utf-8" },
    }).then(this.#handleRequest);

  onRegister = async (body) =>
    await fetch(this.#urls.register, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { ...this.#headers, "Content-Type": "application/json;charset=utf-8" },
    }).then(this.#handleRequest);

  getUsers = async () => await fetch(this.#urls.users, { headers: this.#headers }).then(this.#handleRequest);

  onUpdateUser = async (userId, data) =>
    await fetch(`${this.#urls.updateUser}/${userId}`, {
      method: "PUT",
      headers: { ...this.#headers, "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify(data),
    }).then(this.#handleRequest);

  onDeleteUsers = async (userIds = []) =>
    await fetch(`${this.#urls.deleteUsers}`, {
      method: "DELETE",
      headers: { ...this.#headers, "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify(userIds),
    }).then(this.#handleRequest);
}

export const api = new Api();
