import { Form, Button, Panel, Stack, Tooltip, Whisper } from "rsuite";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useActions } from "../../store";

export const SignUp = () => {
  const {
    dataFields: { username, password, email },
    errors,
    hasErrors,
  } = useSelector((state) => state.user);

  const { dispatch, actions } = useActions();

  const submit = (
    <Button
      appearance="primary"
      disabled={hasErrors}
      onClick={() => dispatch(actions.onRegister({ username, password, email }))}
    >
      Зарегистрироваться
    </Button>
  );

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      direction="column"
      style={{
        height: "100vh",
      }}
    >
      <Panel bordered style={{ width: 400 }} header="Регистрация">
        <p style={{ marginBottom: 10 }}>
          <span className="text-muted">Зарегистрированы? </span> <Link to="/signin"> Войти</Link>
        </p>

        <Form fluid>
          <Form.Group>
            <Form.ControlLabel>Имя</Form.ControlLabel>
            <Form.Control
              name="name"
              value={username}
              onChange={(value) => dispatch(actions.setUsername(value))}
              errorMessage={errors.username}
            />
          </Form.Group>
          <Form.Group>
            <Form.ControlLabel>
              <span>email</span>
            </Form.ControlLabel>
            <Form.Control
              name="email"
              value={email}
              type="email"
              onChange={(value) => dispatch(actions.setEmail(value))}
              errorMessage={errors.email}
            />
          </Form.Group>
          <Form.Group>
            <Form.ControlLabel>
              <span>Пароль</span>
            </Form.ControlLabel>
            <Form.Control
              autoComplete="false"
              name="password"
              type="password"
              value={password}
              onChange={(value) => dispatch(actions.setPassword(value))}
              errorMessage={errors.password}
            />
          </Form.Group>
          <Form.Group>
            {hasErrors ? (
              <Whisper
                placement="right"
                controlId="control-id-hover"
                trigger="hover"
                speaker={<Tooltip>Введены некорректные данные.</Tooltip>}
              >
                {submit}
              </Whisper>
            ) : (
              submit
            )}
          </Form.Group>
        </Form>
      </Panel>
    </Stack>
  );
};
