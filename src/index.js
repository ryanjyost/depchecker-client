import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { withRouter } from "react-router";
import "./index.css";
import MainRouter from "./MainRouter";
import "antd/dist/antd.css";
import * as serviceWorker from "./serviceWorker";
import Firebase, { FirebaseContext } from "./firebase";
import ScrollToTop from "./components/hoc/ScrollToTop";
require("dotenv").config();

const MainWithRouter = withRouter(MainRouter);

ReactDOM.render(
  <Router>
    <FirebaseContext.Provider value={new Firebase()}>
      <ScrollToTop>
        <MainWithRouter />
      </ScrollToTop>
    </FirebaseContext.Provider>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
