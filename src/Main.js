import React, { Component } from "react";
import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/monokai";
import Dropzone from "react-dropzone";
import { Button, Icon, Spin, Progress } from "antd";
import axios from "axios";
import moment from "moment/moment";
import _ from "underscore";
import ReactTable from "react-table";
import "react-table/react-table.css";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import PackageDetails from "./components/PackageDetails";
import { CSVLink, CSVDownload } from "react-csv";
import ExampleJSON from "./example.json";
import socketIOClient from "socket.io-client";

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      step: 1,
      files: [],
      dependencies: [],
      packageJSON: {},
      packageJSONString: "...or paste your package.json file contents here...",
      csvData: [],
      twitterLink: null,
      response: false,
      endpoint: "http://localhost:5000",
      depBeingAnalyzed: "",
      depIndex: 0,
      depsToAnalyze: 0
    };
    this.state = this.initialState;
    this.socket = socketIOClient(this.initialState.endpoint, {
      forceNew: true
    });

    this.client = axios.create({
      baseURL:
        process.env.REACT_APP_API_URL || "https://depchecker-api.herokuapp.com",
      timeout: 3 * 60 * 1000,
      headers: { Accept: "application/json" }
    });
  }

  componentDidMount() {
    const links = [
      "https://twitter.com/iamdevloper?ref_src=twsrc%5Etfw",
      "https://twitter.com/npmjs?ref_src=twsrc%5Etfw",
      "https://twitter.com/JavaScriptDaily?ref_src=twsrc%5Etfw"
    ];

    this.socket.on("update", data =>
      this.setState({
        depBeingAnalyzed: data,
        depIndex: this.state.depIndex + 1
      })
    );

    this.socket.on("final", data => {
      this.setState({
        dependencies: data,
        csvData: data,
        step: 3
      });
    });

    this.setState({
      twitterLink: links[Math.floor(Math.random() * links.length)]
    });
  }

  onDrop(files) {
    console.log("DROP");
    this.setState({ files });
    this.readPackageJSON(files[0]);
  }

  readPackageJSON(file) {
    let formData = new FormData();
    formData.append("file", file);

    this.client
      .post("/read_package_json", formData)
      .then(response => {
        this.setState({
          packageJSON: response.data,
          packageJSONString: JSON.stringify(response.data, null, 2)
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleAnalyze() {
    this.client
      .post("/analyze", { packageJSON: this.state.packageJSON })
      .then(response => {
        this.setState({
          step: 2,
          depsToAnalyze: Object.keys(this.state.packageJSON.dependencies).length
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  componentWillUnmount() {
    this.socket.off("update");
    this.socket.off("final");
    this.socket.disconnect();
  }

  pollProcess() {
    console.log("Polling");
  }

  onChooseExample() {
    this.setState({
      packageJSONString: JSON.stringify(ExampleJSON, null, 2),
      packageJSON: ExampleJSON
    });
  }

  handleStartOver() {
    this.setState(this.initialState);
  }

  render() {
    const { dependencies, files, packageJSON, step } = this.state;

    const mainStyles = {
      borderRadius: 3,
      backgroundColor: "#f0f2f5",
      white: "#fff",
      whiteOp: opacity => `rgba(255, 255, 255, ${opacity})`,
      blackOp: opacity => `rgba(0, 0, 0, ${opacity})`,
      blue: "rgba(24, 144, 255, 1)",
      blueOp: opacity => `rgba(24, 144, 255, ${opacity})`,
      red: "rgba(245, 34, 45, 1)",
      redOp: opacity => `rgba(245, 34, 45, ${opacity})`,
      green: "rgba(82, 196, 26, 1)",
      greenOp: opacity => `rgba(82, 196, 26, ${opacity})`
    };

    const renderUpload = () => {
      const uploadWidth = "100%";
      const baseStyle = {
        width: uploadWidth,
        flex: 0.2,
        borderWidth: 2,
        borderColor: "rgba(0,0,0,0.05)",
        borderStyle: "dashed",
        borderRadius: 3,
        backgroundColor: mainStyles.whiteOp(0.95),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      };

      const activeStyle = {
        borderStyle: "solid",
        borderColor: mainStyles.blueOp(0.8),
        backgroundColor: mainStyles.blueOp(0.05)
      };
      const rejectStyle = {
        borderStyle: "solid",
        borderColor: mainStyles.redOp(0.8),
        backgroundColor: mainStyles.redOp(0.05)
      };
      const hasFileStyle = {
        // borderColor: mainStyles.greenOp(0.8),
        // backgroundColor: mainStyles.greenOp(0.05),
        borderStyle: "solid",
        borderColor: mainStyles.blueOp(0.8),
        backgroundColor: mainStyles.white,
        cursor: "pointer"
      };

      const hasFile = "dependencies" in this.state.packageJSON;

      return (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "stretch",
            alignItems: "stretch",
            padding: "20px 50px"
          }}
        >
          <Dropzone
            onDrop={files => this.onDrop(files)}
            accept="application/json"
            disableClick={!hasFile}
          >
            {({
              getRootProps,
              getInputProps,
              isDragActive,
              isDragAccept,
              isDragReject,
              acceptedFiles,
              rejectedFiles,
              open
            }) => {
              let styles = { ...baseStyle };
              styles = hasFile ? { ...styles, ...hasFileStyle } : styles;
              styles = isDragActive ? { ...styles, ...activeStyle } : styles;
              styles = isDragReject ? { ...styles, ...rejectStyle } : styles;

              let text = "Drag your file here or";
              if (isDragActive && !isDragReject) {
                text = <strong>{`Drop it like it's hot`}</strong>;
              } else if (hasFile) {
                text = (
                  <span>
                    Dependencies for <strong>{packageJSON.name}</strong> are
                    ready to analyze
                  </span>
                );
              } else if (isDragReject) {
                text = (
                  <span>
                    Please upload a <strong>package.json</strong> file
                  </span>
                );
              }

              return (
                <div {...getRootProps()} style={styles} id={"dropzone"}>
                  <input {...getInputProps()} />

                  {isDragReject ? (
                    <Icon
                      style={{
                        fontSize: 40,
                        color: mainStyles.redOp(0.7)
                      }}
                      type="stop"
                    />
                  ) : (
                    <Icon
                      style={{
                        fontSize: 40,
                        color:
                          hasFile && !isDragActive
                            ? mainStyles.blueOp(1)
                            : mainStyles.blueOp(0.7)
                      }}
                      type={
                        isDragActive
                          ? "fire"
                          : hasFile
                            ? "like"
                            : "cloud-upload"
                      }
                    />
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 10
                    }}
                  >
                    <div
                      style={{
                        marginRight: 10,
                        fontSize: 16,
                        color: mainStyles.blackOp(0.5)
                      }}
                    >
                      {text}
                    </div>
                    {isDragActive || hasFile ? null : (
                      <Button
                        size={"small"}
                        type="primary"
                        onClick={() => open()}
                      >
                        browse
                      </Button>
                    )}
                  </div>
                </div>
              );
            }}
          </Dropzone>
          <AceEditor
            value={this.state.packageJSONString}
            fontSize={14}
            mode="json"
            theme="monokai"
            onChange={val => {
              if (!val.length) {
                this.setState({ files: [] });
              }

              this.setState({
                packageJSONString: val,
                packageJSON: val.length ? JSON.parse(val) : {}
              });
            }}
            name="aceEditor"
            style={{
              width: "100%",
              height: 400,
              marginTop: 20,
              flex: 0.8,
              borderRadius: 3
            }}
          />
        </div>
      );
    };

    const renderResults = () => {
      return (
        <div
          id="depResultsList"
          style={{
            height: "calc(100vh - 50px)",
            overflowY: "auto",
            width: "100%"
          }}
        >
          {dependencies.map((dep, i) => (
            <PackageDetails
              dep={dep}
              repo={packageJSON}
              key={i}
              index={i}
              mainStyles={mainStyles}
            />
          ))}
        </div>
      );
    };

    const renderLoading = () => {
      return (
        <div
          style={{
            height: "calc(100vh - 50px)",
            overflowY: "auto",
            width: "100%",
            padding: 50,
            margin: "auto",
            display: step === 2 ? "flex" : "none",
            justifyContent: "center"
          }}
        >
          <a
            data-width="500"
            className="twitter-timeline"
            // href={this.state.twitterLink}
            href={this.state.twitterLink}
          >
            Tweets to pass the time
          </a>
        </div>
      );
    };

    const renderCSVLink = () => {
      const headers = [
        { label: "Name", key: "name" },
        { label: "Description", key: "description" },
        { label: "Versions Behind", key: "versionsBehindText" },
        { label: "Project Version", key: "currentProjectVersion" },
        { label: "Latest Release", key: "latestVersion" },
        { label: "Time Since Latest", key: "timeSinceLastVersionRelease" },
        { label: "Latest Release Date", key: "lastReleaseDate" },
        { label: "Weekly Downloads", key: "weeklyDownloads" },
        { label: "Open Issues & Pull Requests", key: "openIssuesAndPRs" },
        { label: "License", key: "license" },
        { label: "Homepage", key: "homepage" }
      ];
      return (
        <CSVLink
          data={this.state.csvData}
          headers={headers}
          filename={`${this.state.packageJSON.name}_dependencies`}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Button
            disabled={step !== 3}
            size={"large"}
            style={{
              margin: "auto",
              backgroundColor: step === 3 ? "#217346" : null,
              color: step === 3 ? "#fff" : null,
              fontWeight: "bold"
            }}
          >
            <Icon type="download" style={{ marginRight: 3 }} />Download CSV File
          </Button>
        </CSVLink>
      );
    };

    const renderSteps = () => {
      console.log(
        this.state.depBeingAnalyzed,
        this.state.depIndex,
        this.state.depsToAnalyze
      );
      const baseStyle = {
        flex: 1,
        borderRight: `2px solid ${mainStyles.blackOp(0.1)}`,
        backgroundColor: mainStyles.whiteOp(1),
        opacity: 0.3,
        padding: 30,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative"
      };
      const activeStyle = {
        backgroundColor: mainStyles.blueOp(0.05),
        opacity: 1,
        borderRight: `0px solid transparent`,
        borderTop: step === 1 ? null : `1px solid ${mainStyles.blackOp(0.05)}`,
        borderBottom: `1px solid ${mainStyles.blackOp(0.05)}`
      };
      const disableAnalyze =
        !("dependencies" in this.state.packageJSON) || step !== 1;

      const renderNumber = (num, opaque) => {
        return (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 50,
              backgroundColor:
                num > step ? mainStyles.blackOp(0.1) : mainStyles.blueOp(1),
              color: num > step ? mainStyles.blackOp(0.8) : mainStyles.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: "bold",
              marginRight: 10,
              position: "absolute",
              top: 20,
              left: 20,
              opacity: opaque ? 0.3 : 1
            }}
          >
            {num}
          </div>
        );
      };

      const renderLoadingStep = () => {
        return (
          <div
            style={{
              ...baseStyle,
              ...(step === 2 && activeStyle)
            }}
          >
            {renderNumber(2)}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "20px 0px 15px 0px"
              }}
            >
              <div
                style={{ fontSize: 18, textAlign: "center", lineHeight: 1.2 }}
              >
                <strong>Relax</strong>{" "}
                <span style={{ color: mainStyles.blackOp(0.4) }}>
                  while DepChecker does its thing
                </span>
              </div>
              {this.state.depBeingAnalyzed && (
                <div>
                  {this.state.depBeingAnalyzed} {this.state.depIndex}
                </div>
              )}
              <div style={{ width: "100%" }}>
                <Progress
                  format={percent =>
                    `${this.state.depIndex}/${this.state.depsToAnalyze}`
                  }
                  percent={
                    (this.state.depIndex / this.state.depsToAnalyze) * 100
                  }
                  status={step === 2 && "active"}
                />
              </div>
            </div>
          </div>
        );
      };

      return (
        <div
          style={{
            display: "flex",
            flex: 0.4,
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "stretch"
          }}
        >
          {step === 3 ? (
            <div
              style={{
                ...baseStyle,
                ...{
                  opacity: 1,
                  borderRight: `2px solid ${mainStyles.blackOp(0.05)}`
                }
              }}
            >
              {renderNumber(1, true)}

              <Button
                className={"pulsingButton"}
                onClick={() => this.handleStartOver()}
                type="primary"
                size={"large"}
                style={{
                  margin: "20px auto 0px auto",
                  fontWeight: "bold",
                  maxWidth: "300px"
                }}
              >
                Start Over
              </Button>
            </div>
          ) : (
            <div
              style={{
                ...baseStyle,
                ...(step === 1 && activeStyle)
              }}
            >
              {renderNumber(1)}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span style={{ fontSize: 18, textAlign: "center" }}>
                  <strong>Upload</strong>{" "}
                  <span style={{ color: mainStyles.blackOp(0.4) }}>
                    a package.json file
                  </span>
                </span>
              </div>
              <div
                style={{
                  textAlign: "center",
                  marginTop: 0,
                  fontSize: 12
                }}
              >
                <span style={{ opacity: 0.5 }}>Curious how it works?</span>
                <a
                  style={{ marginLeft: 3, opacity: 1 }}
                  onClick={() => {
                    if (step === 1) {
                      this.onChooseExample();
                    }
                  }}
                >
                  Try an example
                </a>
              </div>
              <Button
                className={disableAnalyze ? null : "pulsingButton"}
                onClick={() => this.handleAnalyze()}
                type="primary"
                disabled={disableAnalyze}
                size={"large"}
                style={{
                  margin: "20px auto 0px auto",
                  fontWeight: "bold",
                  maxWidth: "300px"
                }}
              >
                Generate Report
              </Button>
            </div>
          )}
          {renderLoadingStep()}
          <div
            style={{
              ...baseStyle,
              ...(step === 3 && activeStyle)
            }}
          >
            {renderNumber(3)}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "20px 0px 15px 0px"
              }}
            >
              <span
                style={{ fontSize: 18, textAlign: "center", lineHeight: 1.2 }}
              >
                <strong>Export</strong>{" "}
                <span style={{ color: mainStyles.blackOp(0.4) }}>
                  your project's dependency report
                </span>
              </span>
            </div>
            {renderCSVLink()}
          </div>
        </div>
      );
    };

    return (
      <div style={{ height: "100vh" }}>
        <div
          style={{
            height: 50,
            width: "100%",
            minWidth: 1000,
            borderBottom: `2px solid ${mainStyles.blackOp(0.05)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 40px"
          }}
        >
          <div style={{ fontSize: 20, fontWeight: "bold" }}>DepChecker</div>
          {/*<div style={{ display: "flex", alignItems: "center" }}>*/}
          {/*<Button size={"small"} style={{ marginRight: 10 }}>*/}
          {/*Report a bug*/}
          {/*</Button>*/}
          {/*<Button size={"small"}>Make a feature request</Button>*/}
          {/*</div>*/}
        </div>
        <div
          style={{
            display: "flex",
            minWidth: 1000,
            minHeight: 650,
            height: "calc(100vh - 50px)",
            overflowX: "auto",
            alignItems: "stretch",
            justifyContent: "center",
            backgroundColor: "#fff",
            margin: "auto"
          }}
        >
          {renderSteps()}
          <div
            style={{
              flex: 0.6,
              display: "flex",
              alignItems: "stretch",
              backgroundColor: mainStyles.blueOp(0.05)
            }}
          >
            {step === 3 ? renderResults() : step === 2 ? null : renderUpload()}
            {renderLoading()}
          </div>
        </div>
      </div>
    );
  }
}

// const renderTable = () => {
// 	const columns = [
// 		{
// 			Header: "Name",
// 			accessor: "name",
// 			Cell: props => {
// 				return <div>{props.value}</div>;
// 			}
// 		},
// 		{
// 			Header: "Versions Behind",
// 			id: "project_ver",
// 			style: { textAlign: "center" },
// 			accessor: "name",
// 			Cell: props => {
// 				const currentProjectVersion = packageJSON.dependencies[
// 					props.original.name
// 					].replace(/[\^~]/g, "");
// 				const levels = currentProjectVersion.split(".");
//
// 				const currentVersionBreakdown = {
// 					major: Number(levels[0]),
// 					minor: Number(levels[1]),
// 					patch: Number(levels[2])
// 				};
//
// 				const mostRecentReleaseBreakdown = {
// 					major: Number(props.original["dist-tags"].latest.split(".")[0]),
// 					minor: Number(props.original["dist-tags"].latest.split(".")[1]),
// 					patch: Number(props.original["dist-tags"].latest.split(".")[2])
// 				};
//
// 				const versionsBehind = {
// 					major:
// 					mostRecentReleaseBreakdown.major -
// 					currentVersionBreakdown.major,
// 					minor:
// 					mostRecentReleaseBreakdown.minor -
// 					currentVersionBreakdown.minor,
// 					patch:
// 					mostRecentReleaseBreakdown.patch - currentVersionBreakdown.patch
// 				};
//
// 				let text = "";
//
// 				if (
// 					versionsBehind.major === 0 &&
// 					versionsBehind.minor === 0 &&
// 					versionsBehind.patch === 0
// 				) {
// 					text = "Up to date";
// 				} else {
// 					if (versionsBehind.major > 0) {
// 						text = `${
// 							versionsBehind.major > 0
// 								? `${versionsBehind.major} major${
// 									versionsBehind.major === 1 ? "" : "s"
// 									}`
// 								: ""
// 							}  `;
// 					} else if (versionsBehind.minor > 0) {
// 						text = `${
// 							versionsBehind.minor > 0
// 								? `${versionsBehind.minor} minor${
// 									versionsBehind.minor === 1 ? "" : "s"
// 									}`
// 								: ""
// 							}  `;
// 					} else if (versionsBehind.patch > 0) {
// 						text = `${
// 							versionsBehind.patch > 0
// 								? `${versionsBehind.patch} patch${
// 									versionsBehind.patch === 1 ? "" : "es"
// 									}`
// 								: ""
// 							}  `;
// 					}
// 				}
//
// 				return <span>{text}</span>;
// 			}
// 		},
// 		{
// 			Header: "Your Project Version",
// 			id: "project_ver",
// 			style: { textAlign: "center" },
// 			accessor: "name",
// 			Cell: props => {
// 				const currentProjectVersion = packageJSON.dependencies[
// 					props.original.name
// 					].replace(/[\^~]/g, "");
//
// 				return <span>{currentProjectVersion}</span>;
// 			}
// 		},
// 		{
// 			Header: "Latest Release",
// 			id: "release",
// 			style: { textAlign: "center" },
// 			accessor: "name",
// 			Cell: props => {
// 				return <span>{props.original["dist-tags"].latest}</span>;
// 			}
// 		},
// 		{
// 			Header: "Latest Release Date",
// 			accessor: "pub",
// 			style: { textAlign: "center" },
// 			Cell: props => {
// 				return (
// 					<div>
// 						{timeAgo.format(
// 							moment(
// 								props.original.time[props.original["dist-tags"].latest]
// 							).toDate()
// 						)}
// 					</div>
// 				);
// 			}
// 		}
// 	];
//
// 	return (
// 		<ReactTable
// 			filterable
// 			data={dependencies}
// 			columns={columns}
// 			style={{ width: "100%" }}
// 			defaultFilterMethod={(filter, row, column) => {
// 				const id = filter.pivotId || filter.id;
// 				return row[id] !== undefined
// 					? String(row[id]).startsWith(filter.value)
// 					: true;
// 			}}
// 			SubComponent={row => (
// 				<PackageDetails row={row} dep={row.original} repo={packageJSON} />
// 			)}
// 			className={"-highlight"}
// 		/>
// 	);
// };
