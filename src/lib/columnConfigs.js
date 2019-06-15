import React from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import numeral from "numeral";
import moment from "moment/moment";
import Helpers from "../lib/helpers";
import { Icon, Tooltip, Popover } from "antd";
import licenses from "../lib/licenses";
import {
  buildVersionsBehindText,
  getLicenseDataForDep,
  getLicenseLevel,
  getHighestVulnerabilityScore
} from "./helpers";

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

const good = "rgba(82, 196, 26, 0.2)";
const fine = "rgba(0,255,255, 0.2)";
const warn = "rgba(248, 255, 112, 0.3)";
const bad = "rgba(245, 34, 45, 0.2)";
const colors = [good, fine, warn, bad, null];

const divStyle = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const hasGithub = row => row.github && typeof row.github === "object";

const buildLinks = dep => {
  return [
    {
      id: "github",
      label: (
        <Icon
          style={{
            fontSize: 14
          }}
          type="github"
        />
      ),
      href: hasGithub(dep) ? dep.github.html_url : null
    },
    {
      id: "home",
      label: (
        <Icon
          style={{
            fontSize: 14
          }}
          type="home"
        />
      ),
      href: dep.homepage
    },
    {
      id: "npm",
      label: "npm",
      href: `https://www.npmjs.com/package/${dep.name}`
    }
  ];
};

const levels = {};

const buildColumns = (packageJSON, styles, buildForExport) => {
  const dependencies = {
    ...packageJSON.dependencies,
    ...packageJSON.devDependencies
  };
  const columns = [
    {
      Header: "Name",
      accessor: "name",
      width: 300,
      style: { whiteSpace: "unset" },
      Cell: row => {
        const dep = row.original;
        const githubLink = hasGithub(row.original)
          ? row.original.github.html_url
          : null;
        const links = buildLinks(dep);
        return (
          <div
            style={{
              padding: "8px 8px 8px 8px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <h4
              style={{
                marginBottom: 0
              }}
            >
              <Tooltip title={row.original.description} placement={"topLeft"}>
                <div style={{ display: "inline-block" }}>
                  {githubLink ? (
                    <a
                      href={githubLink}
                      target={"_blank"}
                      style={{
                        color: styles.blackOp(0.95),
                        fontWeight: "bold"
                      }}
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}{" "}
                  <Icon
                    type={"info-circle"}
                    className={"hoverOpacity"}
                    style={{
                      fontSize: 12,
                      color: styles.blue,
                      opacity: 0.5,
                      margin: "0px 10px 0px 5px"
                    }}
                  />
                </div>
              </Tooltip>
              {links.map(link => {
                if (!link.href) {
                  return null;
                } else {
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target={"_blank"}
                      className={"hoverOpacity"}
                      style={{
                        margin: "0px 10px 0px 0px",
                        fontSize: 12,
                        color: styles.blue,
                        opacity: 0.5
                      }}
                    >
                      {link.label}
                    </a>
                  );
                }
              })}
            </h4>
          </div>
        );
      }
    },
    {
      Header: "Project",
      id: "project_ver",
      style: { textAlign: "center" },
      accessor: row => dependencies[row.name],
      filterable: false,
      sortable: false,
      width: 100,
      Cell: row => {
        const currentProjectVersion = dependencies[row.original.name];

        return <div style={divStyle}>{currentProjectVersion}</div>;
      }
    },
    {
      Header: "LTS",
      id: "release",
      style: { textAlign: "center" },
      accessor: row => row["dist-tags"].latest,
      filterable: false,
      sortable: false,
      width: 100,
      Cell: row => {
        return <span style={divStyle}>{row.value}</span>;
      }
    },
    {
      Header: "Versions Behind",
      id: "ver_behind",
      style: { textAlign: "center" },
      filterable: false,
      sortMethod: Helpers.sortVersionsBehind,
      accessor: row => {
        if (!row["dist-tags"]) return null;

        const currentProjectVersion = dependencies[row.name].replace(
          /[\^~]/g,
          ""
        );
        const levels = currentProjectVersion.split(".");

        const mostRecentReleaseBreakdown = {
          major: Number(row["dist-tags"].latest.split(".")[0]),
          minor: Number(row["dist-tags"].latest.split(".")[1]),
          patch: Number(row["dist-tags"].latest.split(".")[2])
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
        if (!row.value) return null;

        const versionsBehind = row.value;
        const text = Helpers.buildVersionsBehindText(row.value);

        let backgroundColor = good;
        if (versionsBehind.major) {
          backgroundColor = bad;
        } else if (versionsBehind.minor) {
          backgroundColor = warn;
        } else if (versionsBehind.patch) {
          backgroundColor = fine;
        }

        if (hasGithub(row.original)) {
          return (
            <div style={{ backgroundColor, ...divStyle }}>
              <a
                href={`${row.original.github.html_url}/releases`}
                target={"_blank"}
                style={{ color: styles.blackOp(0.8) }}
                className={"hoverUnderline"}
              >
                {text}
              </a>
            </div>
          );
        }
        return <div style={{ backgroundColor, ...divStyle }}>{text}</div>;
      },
      _export: data => Helpers.buildVersionsBehindText(data)
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
          backgroundColor = warn;
        } else if (
          Math.abs(moment.unix(row.value).diff(moment(), "months")) > 2
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
      },
      _export: timestamp => moment.unix(timestamp).format("MM/DD/YYYY")
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
          backgroundColor = warn;
        } else if (row.value < 100000) {
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
      Header: "Stargazers",
      id: "stargazers",
      accessor: row => (hasGithub(row) ? row.github.stargazers_count : null),
      style: { textAlign: "center" },
      width: 120,
      filterable: false,
      Cell: row => {
        let backgroundColor = good;
        if (row.value < 50) {
          backgroundColor = bad;
        } else if (row.value < 300) {
          backgroundColor = warn;
        } else if (row.value < 1000) {
          backgroundColor = fine;
        }

        return (
          <div style={{ ...divStyle, ...{ backgroundColor } }}>
            {row.value === null ? (
              ""
            ) : (
              <span>
                {" "}
                <span style={{ opacity: 0.4 }}>&#9733;</span>{" "}
                {numeral(row.value).format("0,0")}
              </span>
            )}
          </div>
        );
      }
    },
    {
      Header: "License",
      id: "license",
      filterable: false,
      sortable: false,
      accessor: row => getLicenseDataForDep(row),
      width: 100,
      Cell: row => {
        let backgroundColor = colors[getLicenseLevel(row.value)];

        return (
          <div style={{ ...divStyle, ...{ height: "100%", backgroundColor } }}>
            {row.value ? row.value.spdx_id || row.value : ""}
          </div>
        );
      },
      _export: licenseData => {
        if (!licenseData) return "";
        if (typeof licenseData === "string") {
          return licenseData;
        } else if ("spdx_id" in licenseData) {
          return licenseData.spdx_id;
        } else return "";
      },
      _Header: "Vulnerabilities"
    },
    {
      Header: "Issues + PRs",
      id: "issues",
      accessor: row => (hasGithub(row) ? row.github.open_issues_count : null),
      style: { textAlign: "center" },
      width: 80,
      filterable: false,
      Cell: row => {
        if (row.value === null) return <div style={divStyle}>N/A</div>;
        if (row.original.bugs && row.original.bugs.url) {
          return (
            <a href={row.original.bugs.url} target={"_blank"} style={divStyle}>
              {numeral(row.value).format("0,0")}
            </a>
          );
        }
        return <div style={divStyle}>{numeral(row.value).format("0,0")}</div>;
      }
    }
  ];

  return columns;
};

export default buildColumns;

// {
// 	Header: () => (
// 		<Tooltip title={"Uses Sonatype OSS Index"} placement={"top"}>
// 			<span>Vulnerabilities </span>
// 		</Tooltip>
// 	),
// 		id: "vulnerabilities",
// 	accessor: row =>
// 	row.ossIndex ? getHighestVulnerabilityScore(row.ossIndex) : null,
// 	filterable: false,
// 	width: 120,
// 	Cell: row => {
// 	const dep = row.original;
// 	const ossLink = dep.ossIndex ? dep.ossIndex.reference : null;
// 	let backgroundColor = null,
// 		text = "N/A";
//
// 	if (row.value === null) {
// 		backgroundColor = null;
// 		text = "N/A";
// 	} else if (row.value < 0) {
// 		backgroundColor = good;
// 		text = "None";
// 	} else if (row.value < 4) {
// 		backgroundColor = fine;
// 		text = "Low";
// 	} else if (row.value < 7) {
// 		backgroundColor = warn;
// 		text = "Medium";
// 	} else if (row.value <= 10) {
// 		backgroundColor = bad;
// 		text = "High";
// 	}
//
// 	return (
// 		<a
// 			href={ossLink}
// 			className={ossLink ? "hoverUnderline" : null}
// 			target={"_blank"}
// 			style={{
// 				...divStyle,
// 				...{
// 					backgroundColor,
// 					color: styles.blackOp(0.8),
// 					cursor: ossLink ? "cursor" : "default"
// 				}
// 			}}
// 		>
// 			{text}
// 		</a>
// 	);
// },
// 	_export: ossScore => {
// 	let text = "N/A";
// 	if (ossScore === null) {
// 		text = "N/A";
// 	} else if (ossScore < 0) {
// 		text = "None";
// 	} else if (ossScore < 4) {
// 		text = "Low";
// 	} else if (ossScore < 7) {
// 		text = "Medium";
// 	} else if (ossScore <= 10) {
// 		text = "High";
// 	}
//
// 	return text;
// }
// },
