import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Icon } from "antd";
import ROUTES from "../lib/routes";

const Header = ({ styles, showContactText, whiteBackground }) => {
  const renderLogo = () => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={"android-chrome-192x192.png"}
          height={24}
          style={{ borderRadius: 2 }}
        />
        <h3
          style={{
            margin: "0px 5px",
            color: styles.blackOp(0.6),
            position: "relative",
            fontWeight: "900"
          }}
        >
          DepChecker
          <span
            style={{
              position: "absolute",
              right: -29,
              top: -7,
              fontSize: 6,
              backgroundColor: styles.blueOp(0.95),
              color: "#fff",
              padding: "2px 7px",
              borderRadius: 20,
              fontWeight: "bold"
            }}
          >
            BETA
          </span>
        </h3>
      </div>
    );
  };

  const renderSignInButton = () => {
    return null;
    return <Link to={ROUTES.SIGNIN}>Sign In &rarr;</Link>;
  };

  const renderMadeByRyan = () => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginRight: 5, color: "#a4a4a4" }}>Made by</div>
        <a
          id={"ryanPersonalSite"}
          href={"https://ryanjyost.com"}
          target={"_blank"}
        >
          Ryan
        </a>
        <span style={{ padding: "0px 5px", color: styles.blackOp(0.2) }}>
          |
        </span>
        {showContactText && (
          <div style={{ marginRight: 5, color: "#a4a4a4" }}>
            Bug?&nbsp;&nbsp;Question?&nbsp;&nbsp;Feature request?&nbsp;
          </div>
        )}
        <a id={"contactFromHeader"} href={"mailto:ryan@depchecker.com"}>
          Contact
        </a>
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1,
        backgroundColor: whiteBackground ? "#fff" : null,
        // borderBottom: `2px solid rgba(0, 0, 0, 0.04)`,
        padding: "20px 20px"
      }}
    >
      <div style={{ flex: 1 }}>{renderLogo()}</div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end"
        }}
      >
        {renderMadeByRyan()}
      </div>
    </div>
  );
};

export default Header;
