import React from "react";
import ErrorBoundary from "./ErrorBoundary";

export default function renderRoute(Component, props, user, styles) {
  if (true) {
    return (
      <ErrorBoundary>
        <Component {...props} styles={styles} />
      </ErrorBoundary>
    );
  } else {
    return <div>hey</div>;
  }
}
