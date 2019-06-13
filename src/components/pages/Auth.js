import React, { Component } from "react";
import { Input, Icon, Button, Checkbox } from "antd";
import { Link } from "react-router-dom";
import ROUTES from "../../lib/routes";

export default class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { styles } = this.props;
    const labelStyle = {
      color: "rgba(0,0,0,0.6)",
      fontSize: 12,
      padding: "0px 0px 0px 0px",
      fontWeight: "bold",
      marginBottom: 3
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            width: 450,
            padding: "50px 50px 50px 50px",
            backgroundColor: "#fff"
          }}
        >
          <label style={labelStyle}>Email</label>
          <Input
            style={{ marginBottom: 10 }}
            size={"large"}
            prefix={
              <Icon
                type="user"
                style={{ color: "rgba(0,0,0,.25)", marginRight: 10 }}
              />
            }
            value={this.state.email}
            onChange={e => this.setState({ email: e.target.value })}
          />
          <label style={labelStyle}>Password </label>
          <Input
            style={{ marginBottom: 10 }}
            value={this.state.password1}
            size={"large"}
            prefix={
              <Icon
                type="lock"
                style={{ color: "rgba(0,0,0,.25)", marginRight: 10 }}
              />
            }
            onChange={e => this.setState({ password1: e.target.value })}
            type={"password"}
          />
          <Button
            size={"large"}
            style={{ marginTop: 20 }}
            type="primary"
            disabled={false}
            className={"shadow shadowHover"}
            onClick={() => this.onSignIn()}
          >
            {"Create Account"}
          </Button>
        </div>
      </div>
    );
  }
}
