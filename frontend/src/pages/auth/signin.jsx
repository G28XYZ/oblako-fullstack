import { Form, Button, Panel, Whisper, Tooltip } from "rsuite";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useActions } from "../../store";

export const SignIn = () => {
  const {
    dataFields: { email, password },
    errors,
    hasErrors,
    requestErrors,
  } = useSelector((state) => state.user);

  const { dispatch, actions } = useActions((actions) => actions.user);

  const submit = (
    <Button appearance="primary" disabled={hasErrors} onClick={() => dispatch(actions.onLogin({ email, password }))}>
      Войти
    </Button>
  );

  return (
    <Panel bordered style={{ width: 400, overflow: "visible" }} header="Авторизация">
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
            errorPlacement="rightEnd"
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
            errorPlacement="rightEnd"
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
        {Boolean(requestErrors.length) && <span>{requestErrors.map((item) => item?.message)}</span>}
      </Form>
    </Panel>
  );
};
