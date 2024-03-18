import { Steps } from "rsuite";
import PencilSquareIcon from "@rsuite/icons/legacy/PencilSquare";
import BookIcon from "@rsuite/icons/legacy/Book";
import CharacterAuthorizeIcon from "@rsuite/icons/CharacterAuthorize";
import InfoOutlineIcon from "@rsuite/icons/InfoOutline";
import { useState } from "react";

export const AuthHeader = ({ title, current, setCurrent }) => {
  return (
    <Steps current={current} style={{ paddingBottom: 20 }}>
      <Steps.Item
        onClick={() => setCurrent(0)}
        title={<span style={{ cursor: "pointer" }}>{title}</span>}
        icon={<CharacterAuthorizeIcon style={{ fontSize: 30, cursor: "pointer" }} />}
      />
      <Steps.Item
        onClick={() => setCurrent(1)}
        title={<span style={{ cursor: "pointer" }}>О приложении</span>}
        icon={<InfoOutlineIcon style={{ fontSize: 30, cursor: "pointer" }} />}
      />
    </Steps>
  );
};
