import React from "react";
import moment from "moment/moment";
import _ from "underscore";
import { Checkbox, Button, Card, Icon } from "antd";
import ReactTable from "react-table";
import "react-table/react-table.css";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import numeral from "numeral";

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

const Results = ({ packageJSON, dependencies }) => {
  const good = "rgba(82, 196, 26, 0.2)";
  const fine = "rgba(248, 255, 112, 0.3)";
  const bad = "rgba(245, 34, 45, 0.2)";

  const divStyle = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const columns = [
    {
      Header: "Name",
      accessor: "name",
      width: 220,
      Cell: props => {
        return (
          <div style={{ fontWeight: "bold", padding: "5px 7px 5px 7px" }}>
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

        return <div style={divStyle}>{currentProjectVersion}</div>;
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
        return (
          <span style={divStyle}>{props.original["dist-tags"].latest}</span>
        );
      }
    },
    {
      Header: "Ver. Behind",
      id: "ver_behind",
      style: { textAlign: "center" },
      filterable: false,
      sortMethod: (a, b) => {
        a = a.major * 100 || a.minor * 10 || a.patch * 1 || 0;
        b = b.major * 100 || b.minor * 10 || b.patch * 1 || 0;

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

        let backgroundColor = good;
        if (versionsBehind.major) {
          backgroundColor = bad;
        } else if (versionsBehind.minor) {
          backgroundColor = fine;
        }

        return <div style={{ backgroundColor, ...divStyle }}>{text}</div>;
      }
    },
    {
      Header: "Last Publish",
      id: "pub",
      accessor: row => moment(row.time[row["dist-tags"].latest]).unix(),
      style: { textAlign: "center" },
      width: 150,
      filterable: false,
      Cell: row => {
        let backgroundColor = good;
        if (Math.abs(moment.unix(row.value).diff(moment(), "years")) > 0) {
          backgroundColor = bad;
        } else if (
          Math.abs(moment.unix(row.value).diff(moment(), "months")) > 6
        ) {
          backgroundColor = fine;
        }
        return (
          <div style={{ ...divStyle, ...{ backgroundColor } }}>
            {timeAgo.format(
              moment(
                row.original.time[row.original["dist-tags"].latest]
              ).toDate()
            )}
          </div>
        );
      }
    },
    {
      Header: "Weekly Downloads",
      id: "downloads",
      accessor: row => row.weeklyDownloads,
      style: { textAlign: "center" },
      width: 150,
      filterable: false,
      Cell: row => {
        let backgroundColor = good;
        if (row.value < 1000) {
          backgroundColor = bad;
        } else if (row.value < 10000) {
          backgroundColor = fine;
        }
        return (
          <div style={{ ...divStyle, ...{ backgroundColor } }}>
            {numeral(row.value).format("0,0")}
          </div>
        );
      }
    },
    {
      Header: "Issues & PRs",
      id: "issues",
      accessor: row => row.open_issues_count,
      style: { textAlign: "center" },
      width: 100,
      filterable: false,
      Cell: row => {
        return <div style={divStyle}>{numeral(row.value).format("0,0")}</div>;
      }
    },
    {
      Header: "Links",
      id: "links",
      minWidth: 300,
      accessor: row => row.open_issues_count,
      style: { textAlign: "center" },
      filterable: false,
      sortable: false,
      Cell: row => {
        const dep = row.original;
        const links = [
          {
            id: "npm",
            label: "NPM",
            href: `https://www.npmjs.com/package/${dep.name}`
          },
          {
            id: "home",
            label: "Homepage",
            href: dep.homepage
          },
          {
            id: "github",
            label: "Github",
            href: dep.bugs
              ? dep.bugs.url
                ? dep.bugs.url.replace("/issues", "")
                : null
              : null
          },
          {
            id: "issues",
            label: "Issues",
            href: dep.bugs ? (dep.bugs.url ? dep.bugs.url : null) : null
          }
        ];

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 0,
              height: "100%"
            }}
          >
            {links.map(link => {
              if (!link.href) {
                return null;
              } else {
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target={"_blank"}
                    style={{ margin: "0px 5px" }}
                  >
                    {link.label}
                  </a>
                );
              }
            })}
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
          ? String(row[id]).includes(filter.value)
          : true;
      }}
      className={"-highlight"}
    />
  );
};

export default Results;
