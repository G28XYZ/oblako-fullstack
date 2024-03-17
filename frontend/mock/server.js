import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import { compare, genSalt, hash } from "bcrypt";

const server = jsonServer.create();
const routes = jsonServer.router("mock/data.json");
const middlewares = jsonServer.defaults();

const getDbData = {
  users() {
    return routes.db.get("api").find({ id: "users" }).get("data");
  },
};

const authGuard = (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || token === "null" || token === "undefined") {
    throw new Error("Не авторизован");
  }
  return token;
};

const handleRequest = async (fn, { res, req, useAuthGuard = true }) => {
  try {
    useAuthGuard && authGuard(req);
    const result = await fn();
    const data = await new Promise((resolve) => setTimeout(() => resolve(result), 200 + Math.random() * 1000));
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ errors: [{ message: e.message }], success: false });
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

server.get("/me", (req, res) => {
  handleRequest(
    async () => {
      const token = authGuard(req);
      if (Boolean(token)) {
        const email = jwt.verify(token, "jwt_secret")?.data?.email;
        console.log(email);
        if (!email) {
          throw new Error("Не авторизован");
        }
        const users = getDbData.users().value();
        const user = users.find((user) => user.email === email);
        if (!user) {
          throw new Error("Не авторизован");
        }
        if ("password" in user) {
          delete user.password;
        }
        return user;
      }
    },
    { res, req, authGuard: false }
  );
});

server.get("/users", (req, res) => {
  handleRequest(
    async () => {
      return getDbData.users().value();
    },
    { res, req }
  );
});

server.post("/signin", (req, res) => {
  handleRequest(
    async () => {
      const { email, password } = req.body;
      checkEmptyFields([{ email }, { password }]);
      const users = getDbData.users().value();
      const user = users.find((user) => user.email === email);
      const isComparePassword = await compare(password, user.password);
      if (!user || !isComparePassword) {
        throw new Error("Некорректно введены email или пароль");
      }
      return generateToken({ email });
    },
    { res, req, useAuthGuard: false }
  );
});

server.post("/signup", (req, res) => {
  handleRequest(
    async () => {
      const { username, email, password } = req.body;
      checkEmptyFields([{ username }, { email }, { password }]);
      const users = getDbData.users();
      const user = users.value().find((user) => user.email === email);
      if (user) {
        throw new Error("Пользователь с таким email уже зарегистрирован");
      }
      users
        .push({
          id: users.value().length + 1,
          role: "admin",
          username,
          email,
          password: await hash(password, await genSalt(10)),
        })
        .write();

      return generateToken({ email });
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
