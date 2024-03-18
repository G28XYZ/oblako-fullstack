import React, { useState } from "react";
import { Popover, Whisper, Checkbox, Dropdown, IconButton, Table, Toggle } from "rsuite";
import MoreIcon from "@rsuite/icons/legacy/More";
import { useActions } from "../../store";
import { useSelector } from "react-redux";
import AdminIcon from "@rsuite/icons/Admin";

const { Cell } = Table;

export const NameCell = ({ rowData, dataKey, ...props }) => {
  const {
    data: { id: userId },
  } = useSelector((state) => state.user);
  const speaker = (
    <Popover title="Description">
      <p>
        <b>Name:</b> {rowData.name}
      </p>
      <p>
        <b>Gender:</b> {rowData.gender}
      </p>
      <p>
        <b>City:</b> {rowData.city}
      </p>
      <p>
        <b>Street:</b> {rowData.street}
      </p>
    </Popover>
  );

  return (
    <Cell {...props}>
      <span>{dataKey ? rowData[dataKey] : null}</span>
      {userId === rowData.id && (
        <Whisper placement="top" speaker={<Popover>Вы</Popover>}>
          <AdminIcon color="violet" style={{ marginLeft: 6 }} />
        </Whisper>
      )}
    </Cell>
  );
};

export const ImageCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props} style={{ padding: 0 }}>
    <div
      style={{
        width: 40,
        height: 40,
        background: "#f5f5f5",
        borderRadius: "50%",
        marginTop: 2,
        overflow: "hidden",
        display: "inline-block",
      }}
    >
      <img loading="lazy" src={`https://i.pravatar.cc/${rowData.id + 100}`} width="40" />
    </div>
  </Cell>
);

export const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, currentUser, ...props }) => (
  <Cell {...props} style={{ padding: 0 }}>
    <div style={{ lineHeight: "46px" }}>
      <Checkbox
        value={rowData[dataKey]}
        inline
        onChange={onChange}
        checked={checkedKeys.some((item) => item === rowData[dataKey])}
        disabled={currentUser.id === rowData.id}
      />
    </div>
  </Cell>
);

const renderMenu = ({ onClose, left, top, className }, ref) => {
  const handleSelect = (eventKey) => {
    onClose();
    console.log(eventKey);
  };
  return (
    <Popover ref={ref} className={className} style={{ left, top }} full>
      <Dropdown.Menu onSelect={handleSelect}>
        <Dropdown.Item eventKey={1}>Follow</Dropdown.Item>
        <Dropdown.Item eventKey={2}>Sponsor</Dropdown.Item>
        <Dropdown.Item eventKey={3}>Add to friends</Dropdown.Item>
        <Dropdown.Item eventKey={4}>View Profile</Dropdown.Item>
        <Dropdown.Item eventKey={5}>Block</Dropdown.Item>
      </Dropdown.Menu>
    </Popover>
  );
};

export const ActionCell = (props) => {
  return (
    <Cell {...props} className="link-group">
      <Whisper placement="autoVerticalEnd" trigger="click" speaker={renderMenu}>
        <IconButton appearance="subtle" icon={<MoreIcon />} />
      </Whisper>
    </Cell>
  );
};

export const AdminCell = ({ rowData, dataKey, currentUser, ...props }) => {
  const [loading, setLoading] = useState(false);
  const { dispatch, actions } = useActions();
  return (
    <Cell {...props}>
      <Toggle
        loading={loading}
        disabled={currentUser.id === rowData.id}
        checked={rowData[dataKey] === "admin"}
        size="md"
        checkedChildren="Admin"
        unCheckedChildren="User"
        onChange={async () => {
          setLoading(true);
          await dispatch(
            actions.main.onUpdateUser({
              userId: rowData.id,
              data: { role: rowData.role === "admin" ? "user" : "admin" },
            })
          );
          setLoading(false);
        }}
      />
    </Cell>
  );
};
