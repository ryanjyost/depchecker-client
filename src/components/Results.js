import React from "react";
import moment from "moment/moment";
import _ from "underscore";
import ReactTable from "react-table";
import "react-table/react-table.css";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

const Results = ({ packageJSON, dependencies }) => {
  const columns = [
    {
      Header: "Name",
      accessor: "name",
      width: 220,
      Cell: props => {
        return (
          <div style={{ fontWeight: "bold", padding: "0px 0px 0px 10px" }}>
            {props.value}
          </div>
        );
      }
    },

    {
      Header: "Project",
      id: "project_ver",
      style: { textAlign: "center" },
      accessor: "name",
      filterable: false,
      sortable: false,
      width: 100,
      Cell: props => {
        const currentProjectVersion =
          packageJSON.dependencies[props.original.name];

        return <span>{currentProjectVersion}</span>;
      }
    },

    {
      Header: "LTS",
      id: "release",
      style: { textAlign: "center" },
      accessor: "name",
      filterable: false,
      sortable: false,
      width: 100,
      Cell: props => {
        return <span>{props.original["dist-tags"].latest}</span>;
      }
    },
    {
      Header: "Status",
      id: "ver_behind",
      style: { textAlign: "center" },
      sortMethod: (a, b) => {
        console.log(a);
        a = a.major * 100 || a.minor * 10 || a.patch * 1 || 0;
        b = b.major * 100 || b.minor * 10 || b.patch * 1 || 0;

        // console.log(a, b);

        if (a > b) return 1;
        if (b > a) return -1;

        return 0;
      },
      accessor: props => {
        const currentProjectVersion = packageJSON.dependencies[
          props.name
        ].replace(/[\^~]/g, "");
        const levels = currentProjectVersion.split(".");

        const mostRecentReleaseBreakdown = {
          major: Number(props["dist-tags"].latest.split(".")[0]),
          minor: Number(props["dist-tags"].latest.split(".")[1]),
          patch: Number(props["dist-tags"].latest.split(".")[2])
        };

        const currentVersionBreakdown = {
          major: Number(levels[0]),
          minor: Number(levels[1]),
          patch: Number(levels[2])
        };

        return {
          major:
            mostRecentReleaseBreakdown.major - currentVersionBreakdown.major,
          minor:
            mostRecentReleaseBreakdown.minor - currentVersionBreakdown.minor,
          patch:
            mostRecentReleaseBreakdown.patch - currentVersionBreakdown.patch
        };
      },
      width: 100,
      Cell: row => {
        // const currentProjectVersion = packageJSON.dependencies[
        //   row.original.name
        // ].replace(/[\^~]/g, "");
        // const levels = currentProjectVersion.split(".");
        //
        // const mostRecentReleaseBreakdown = row.value;
        //
        // const currentVersionBreakdown = {
        //   major: Number(levels[0]),
        //   minor: Number(levels[1]),
        //   patch: Number(levels[2])
        // };

        const versionsBehind = row.value;

        let text = "";

        if (
          versionsBehind.major === 0 &&
          versionsBehind.minor === 0 &&
          versionsBehind.patch === 0
        ) {
          text = "Up to date";
        } else {
          if (versionsBehind.major > 0) {
            text = `${
              versionsBehind.major > 0
                ? `${versionsBehind.major} major${
                    versionsBehind.major === 1 ? "" : "s"
                  }`
                : ""
            }  `;
          } else if (versionsBehind.minor > 0) {
            text = `${
              versionsBehind.minor > 0
                ? `${versionsBehind.minor} minor${
                    versionsBehind.minor === 1 ? "" : "s"
                  }`
                : ""
            }  `;
          } else if (versionsBehind.patch > 0) {
            text = `${
              versionsBehind.patch > 0
                ? `${versionsBehind.patch} patch${
                    versionsBehind.patch === 1 ? "" : "es"
                  }`
                : ""
            }  `;
          }
        }

        return text;
      }
    },
    {
      Header: "Last Publish",
      accessor: "pub",
      style: { textAlign: "center" },
      Cell: props => {
        return (
          <div>
            {timeAgo.format(
              moment(
                props.original.time[props.original["dist-tags"].latest]
              ).toDate()
            )}
          </div>
        );
      }
    }
  ];

  return (
    <ReactTable
      filterable
      data={dependencies}
      columns={columns}
      defaultPageSize={100}
      style={{
        width: "100%",
        minWidth: 800,
        backgroundColor: "#fefefe",
        borderTop: "none",
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5
      }}
      defaultFilterMethod={(filter, row, column) => {
        const id = filter.pivotId || filter.id;
        return row[id] !== undefined
          ? String(row[id]).startsWith(filter.value)
          : true;
      }}
      className={"-highlight"}
    />
  );
};

export default Results;
