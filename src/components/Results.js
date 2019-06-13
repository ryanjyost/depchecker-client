import React from "react";
import moment from "moment/moment";
import _ from "underscore";
import { Checkbox, Button, Card, Icon } from "antd";
import ReactTable from "react-table";
import "react-table/react-table.css";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import buildColumns from "../lib/columnConfigs";

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

const Results = ({ packageJSON, dependencies }) => {
  const columns = buildColumns(packageJSON);
  return (
    <ReactTable
      filterable
      data={dependencies}
      columns={columns}
      defaultPageSize={20}
      style={{
        maxWidth: "100%",
        backgroundColor: "#fefefe",
        borderTop: "none",
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5
      }}
      defaultFilterMethod={(filter, row, column) => {
        const id = filter.pivotId || filter.id;
        return row[id] !== undefined
          ? String(row[id])
              .toLowerCase()
              .includes(filter.value.toLowerCase())
          : true;
      }}
      className={"-highlight"}
    />
  );
};

export default Results;
