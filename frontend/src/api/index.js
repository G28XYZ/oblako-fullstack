import { AUTH_TOKEN_NAME } from "../utils/constants";

class Api {
  #baseUrl = BASE_URL;

  #token = localStorage.getItem(AUTH_TOKEN_NAME);

  #urls = {
    login: `${this.#baseUrl}/signin`,
    register: `${this.#baseUrl}/signup`,
    me: `${this.#baseUrl}/me`,
  };

  async #handleRequest(response) {
    return response.ok ? response.json() : Promise.reject("Error request");
  }

  get #headers() {
    return { authorization: `Bearer ${this.#token}` };
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
}

export const api = new Api();
