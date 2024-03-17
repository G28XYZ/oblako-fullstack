import { Form, Button, Panel, Stack, Whisper, Tooltip } from "rsuite";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useActions } from "../../store";
import { useEffect } from "react";

export const SignIn = () => {
  const {
    dataFields: { email, password },
    errors,
    hasErrors,
  } = useSelector((state) => state.user);

  const { dispatch, actions } = useActions();

  const submit = (
    <Button appearance="primary" disabled={hasErrors} onClick={() => dispatch(actions.onLogin({ email, password }))}>
      Войти
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
      <Panel bordered style={{ width: 400 }} header="Авторизация">
        <p style={{ marginBottom: 10 }}>
          <span className="text-muted">Не зарегистрированы? </span> <Link to="/signup"> Создать аккаунт</Link>
        </p>

        <Form fluid>
          <Form.Group>
            <Form.ControlLabel>
              <span>email</span>
            </Form.ControlLabel>
            <Form.Control
              name="email"
              value={email}
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
