import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import { compare, genSalt, hash } from "bcrypt";
import lodash from "lodash";

const server = jsonServer.create();
const routes = jsonServer.router("mock/data.json");
const middlewares = jsonServer.defaults();

let isConnected = false;

const dbModel = {
  usersInterval: null,
  users(origin = false) {
    if (origin) {
      return routes.db.get("api").find({ id: "users" });
    }
    return routes.db.get("api").find({ id: "users" }).get("data");
  },
  startInterval() {
    if (!this.usersInterval) {
      this.usersInterval = setInterval(() => {
        if (!isConnected) {
          const currentUsers = this.users().value();
          if (!lodash.isEqual(currentUsers, users)) {
            console.log("[JSON-SERVER] write users");
            dbModel.users(true).set("data", users).set("lastId", lastUserId).write();
            clearInterval(this.usersInterval);
            this.usersInterval = null;
          }
        }
      }, 500);
    }
  },
  commitChanges() {
    this.startInterval();
  },
};

let lastUserId = dbModel.users(true).get("lastId").value();
let users = [...dbModel.users().value()];

const authGuard = (req) => {
  if (req.headers?.authorization) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token || token === "null" || token === "undefined") {
      throw new Error("Не авторизован");
    }
    return token;
  }
};

const handleRequest = async (fn, { res, req, useAuthGuard = true }) => {
  try {
    useAuthGuard && authGuard(req);
    const result = await fn();
    const data = await new Promise((resolve) => setTimeout(() => resolve(result), 200 + Math.random() * 1000));
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ errors: [{ message: e.message }], success: false });
  } finally {
    isConnected = false;
  }
};

const checkEmptyFields = (fieldsArr) => {
  fieldsArr.forEach((item) => {
    const [[key, value]] = Object.entries(item);
    if (!value) {
      throw new Error(`Поле ${key} не должно быть пустым`);
    }
  });
};

const generateToken = (data) => {
  return {
    access_token: jwt.sign({ data }, "jwt_secret", {
      expiresIn: "1d",
    }),
  };
};

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.use("*", (req, res, next) => {
  isConnected = true;
  dbModel.commitChanges();
  next();
});

server.get("/me", (req, res) => {
  handleRequest(
    async () => {
      const token = authGuard(req);
      if (Boolean(token)) {
        const email = jwt.verify(token, "jwt_secret")?.data?.email;
        if (!email) {
          throw new Error("Не авторизован");
        }
        const user = users.find((user) => user.email === email);
        if (!user) {
          throw new Error("Не авторизован");
        }
        let password;
        return { ...user, password };
      }
    },
    { res, req, authGuard: false }
  );
});

server.use("/users/update/:id", (req, res) => {
  if (req.method === "PUT") {
    handleRequest(
      async () => {
        const user = users.find((item) => item.id === parseInt(req.params.id, 10));

        if (!user) {
          throw new Error("Пользователь не найден");
        }

        const body = req.body;

        if (!body) {
          throw new Error("Не переданы данные для обновления пользователя");
        }

        users = users.map((item) => (item.id === user.id ? { ...item, ...body } : item));

        return users;
      },
      { res, req }
    );
  }
});

server.use("/users/delete", (req, res) => {
  if (req.method === "DELETE") {
    handleRequest(
      async () => {
        const userIds = req.body;
        userIds?.forEach((userId) => {
          const user = users.find((item) => item.id === parseInt(userId, 10));

          if (!user) return;

          users = users.filter((item) => item.id !== user.id);
        });

        return users;
      },
      { res, req }
    );
  }
});

server.get("/users", (req, res) => {
  handleRequest(
    async () => {
      return users.map(({ password, ...item }) => item);
    },
    { res, req }
  );
});

server.post("/signin", (req, res) => {
  handleRequest(
    async () => {
      const { email, password } = req.body;
      checkEmptyFields([{ email }, { password }]);
      const user = users.find((user) => user.email === email);
      if (!user) {
        throw new Error("Некорректно введены email или пароль");
      }
      const isComparePassword = await compare(password, user.password);
      if (!isComparePassword) {
        throw new Error("Некорректно введены email или пароль");
      }
      return generateToken({ email });
    },
    { res, req, useAuthGuard: false }
  );
});

server.post("/signup", async (req, res) => {
  await handleRequest(
    async () => {
      const { username, email, password } = req.body;
      checkEmptyFields([{ username }, { email }, { password }]);
      const user = users.find((user) => user.email === email);
      if (user) {
        throw new Error("Пользователь с таким email уже зарегистрирован");
      }
      const newUser = {
        id: ++lastUserId,
        role: "admin",
        username,
        email,
        storage_size: 100,
        files: [],
      };

      users.push({ ...newUser, password: await hash(password, await genSalt(10)) });

      const response = { ...newUser, ...generateToken({ email }) };
      return response;
    },
    { res, req, useAuthGuard: false }
  );
});

const PORT = process.env.PORT || 3000;
const URL = process.env.MAIN_URL || "http://localhost:" + PORT;

server.use(routes);
server.listen(PORT, () => {
  console.log(`start mock server ${URL}`);
});
