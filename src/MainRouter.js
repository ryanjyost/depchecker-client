import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from "react-router-dom";
import { withRouter } from "react-router";
import { Layout, Menu, Icon as AntIcon, Button, Dropdown } from "antd";
import ROUTES from "./lib/routes";

import renderRoute from "./components/hoc/renderRoute";

import Main from "./components/pages/Main";
import Landing from "./components/pages/Landing";
import Auth from "./components/pages/Auth";

export default class MainRouter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      windowWidth: 0
    };
  }

  componentDidMount() {
    this.setState({ didMount: true });
    this.updateDimensions();

    window.addEventListener(
      "resize",
      this.throttle(this.updateDimensions.bind(this), 200)
    );
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions() {
    let windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    let screenHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    // let update_height = Math.round(update_width)

    this.setState({ windowWidth: windowWidth, screenHeight: screenHeight });
  }

  throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  render() {
    const { user, windowWidth } = this.state;

    const mainStyles = {
      borderRadius: 3,
      backgroundColor: "#f0f2f5",
      white: "#fff",
      minMainWidth: this.props.location.pathname === "/app" ? 800 : "100%",
      whiteOp: opacity => `rgba(255, 255, 255, ${opacity})`,
      black: `rgba(3, 19, 33, 1)`,
      blackOp: opacity => `rgba(3, 19, 33, ${opacity})`,
      blue: "rgba(24, 144, 255, 1)",
      blueOp: opacity => `rgba(24, 144, 255, ${opacity})`,
      red: "rgba(245, 34, 45, 1)",
      redOp: opacity => `rgba(245, 34, 45, ${opacity})`,
      green: "rgba(82, 196, 26, 1)",
      greenOp: opacity => `rgba(82, 196, 26, ${opacity})`,
      windowWidth
    };

    return (
      <Layout
        style={{
          backgroundColor: mainStyles.blueOp(0.03),
          minWidth: mainStyles.minMainWidth
        }}
      >
        <Switch>
          <Route
            path={ROUTES.INDEX}
            exact
            render={props => {
              if (user) {
                return (
                  <Redirect
                    to={{
                      pathname: ROUTES.APP,
                      state: { from: props.location }
                    }}
                  />
                );
              } else {
                return <Landing {...props} styles={mainStyles} />;
              }
            }}
          />
          {/*<Route*/}
          {/*exact*/}
          {/*path={ROUTES.SIGNUP}*/}
          {/*render={props => renderRoute(Auth, props, user, mainStyles)}*/}
          {/*/>*/}
          <Route
            exact
            path={ROUTES.APP}
            render={props => renderRoute(Main, props, user, mainStyles)}
          />
          <Route render={props => <Landing {...props} styles={mainStyles} />} />
        </Switch>
      </Layout>
    );
  }
}
