import { Form, Button, Panel, Tooltip, Whisper } from "rsuite";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useActions } from "../../store";
import { useEffect } from "react";

export const SignUp = () => {
  const {
    dataFields: { username, password, email },
    errors,
    hasErrors,
    requestErrors,
  } = useSelector((state) => state.user);

  const { dispatch, actions } = useActions((actions) => actions.user);

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
    <Panel bordered style={{ width: 400, overflow: "visible" }} header="Регистрация">
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
            errorPlacement="rightEnd"
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
            errorMessage={errors.password}
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
