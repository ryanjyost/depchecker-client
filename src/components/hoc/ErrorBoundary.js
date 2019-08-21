import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <h3>
            <strong>Well, this is awkward...something went wrong 😬</strong>
          </h3>
          <p>
            <a href={"mailto:ryan@depchecker.com?subject=Error on DepChecker"}>
              Shoot me an email
            </a>{" "}
            with the package.json that failed and I'll look into it
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
