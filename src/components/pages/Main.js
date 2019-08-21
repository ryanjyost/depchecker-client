import React, { Component } from "react";
import AceEditor from "react-ace";
import Results from "../Results";
import "brace/mode/json";
import "brace/theme/monokai";
import Dropzone from "react-dropzone";
import { Button, Icon, Progress } from "antd";
import axios from "axios";
import ReactTable from "react-table";
import "react-table/react-table.css";
import buildColumns from "../../lib/columnConfigs";
import SimpleStorage from "react-simple-storage";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { CSVLink, CSVDownload } from "react-csv";
import ExampleJSON from "../../example.json";
import socketIOClient from "socket.io-client";
import Header from "../Header";
import { Steps, Tabs, Input } from "antd";
const { TabPane } = Tabs;
const { Step } = Steps;

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      step: 1,
      files: [],
      activeTab: "all",
      dependencies: [],
      devDeps: [],
      packageJSON: {},
      packageJSONString:
        "...simply paste your package.json file contents here...",
      csvData: [],
      twitterLink: null,
      response: false,
      endpoint: "http://localhost:5000",
      depBeingAnalyzed: "",
      depIndex: 0,
      depsToAnalyze: 0,
      repoURL: ""
    };
    this.state = this.initialState;
    this.socket = socketIOClient(
      process.env.REACT_APP_API_URL || "https://depchecker-api.herokuapp.com",
      {
        forceNew: true
      }
    );

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

    this.socket.on("socketId", data => {
      this.setState({
        socketId: data
      });
    });

    this.socket.on("update", data => {
      this.setState({
        depBeingAnalyzed: data,
        depIndex: this.state.depIndex + 1
      });
    });

    this.socket.on("final", data => {
      const devDeps = data.filter(dep => dep.isDev);
      const deps = data.filter(dep => !dep.isDev);
      this.setState({
        dependencies: deps,
        devDeps,
        csvData: data,
        step: 3
      });
    });

    this.setState({
      twitterLink: links[Math.floor(Math.random() * links.length)]
    });
  }

  prepCSVData() {
    const columns = buildColumns(this.state.packageJSON);
    let currentRecords = null;
    switch (this.state.activeTab) {
      case "all":
        currentRecords = this.allDepsTable.getResolvedState().sortedData;
        break;
      case "deps":
        currentRecords = this.depsTable.getResolvedState().sortedData;
        break;
      case "devDeps":
        currentRecords = this.devDepsTable.getResolvedState().sortedData;
        break;
      default:
        currentRecords = this.allDepsTable.getResolvedState().sortedData;
        break;
    }

    let data_to_download = [];
    for (let record of currentRecords) {
      let record_to_download = {};
      for (let col of columns) {
        const accessor = col.accessor;

        let value = null;
        if (typeof accessor === "function") {
          value = accessor(record._original);
        } else {
          value = record[accessor];
        }

        if ("_export" in col) {
          value = col._export(value);
        }
        record_to_download[col._Header || col.Header] = value;
      }

      data_to_download.push(record_to_download);
    }
    this.setState({ csvData: data_to_download }, () => {
      // click the CSVLink component to trigger the CSV download
      this.csvLink.link.click();
    });
  }

  onDrop(files) {
    console.log("DROP");
    this.setState({ files });
    this.readPackageJSON(files[0]);
  }

  readPackageJSON(file) {
    // READ PACKAGE JSON FROM url when isValid and show spinner that its checking
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
    console.log("NALAUZE", this.state.repoURL);
    this.socket.emit(
      "analyze",
      this.state.repoURL || {
        ...{ devDependencies: {} },
        ...this.state.packageJSON
      }
    );
    this.setState({
      step: 2,
      depsToAnalyze: Object.keys({
        ...this.state.packageJSON.dependencies,
        ...this.state.packageJSON.devDependencies
      }).length
    });
    // this.client
    //   .post("/analyze", {
    //     packageJSON: this.state.packageJSON,
    //     socketId: this.state.socketId
    //   })
    //   .then(response => {
    //     this.setState({
    //       step: 2,
    //       depsToAnalyze: Object.keys(this.state.packageJSON.dependencies).length
    //     });
    //   })
    //   .catch(error => {
    //     console.log(error);
    //   });
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
    this.setState({
      ...this.initialState,
      ...{ socketId: this.state.socketId }
    });
  }

  render() {
    const { dependencies, devDeps, files, packageJSON, step } = this.state;
    const mainStyles = this.props.styles;

    let isValidGithubUrl = true;

    // const disableAnalyze =
    //   (!("dependencies" in this.state.packageJSON) && !isValidGithubUrl) ||
    //   step !== 1;

    const disableAnalyze = !("dependencies" in this.state.packageJSON);

    const renderUpload = () => {
      const baseStyle = {
        borderWidth: 2,
        borderColor: mainStyles.blackOp(0.1),
        borderStyle: "dashed",
        borderRadius: 3,
        backgroundColor: "#fff",
        padding: "20px 10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      };

      const activeStyle = {
        borderStyle: "solid",
        borderColor: mainStyles.blueOp(0.8),
        backgroundColor: "#fff"
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

      const renderOrSeparator = () => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0px"
            }}
          >
            <div
              style={{
                width: "50%",
                height: 1,
                backgroundColor: mainStyles.blackOp(0.07)
              }}
            />
            <div
              style={{
                zIndex: 2,
                backgroundColor: mainStyles.blueOp(0.01),
                width: 50,
                textAlign: "center",
                color: mainStyles.blackOp(0.2)
              }}
            >
              OR
            </div>
            <div
              style={{
                width: "50%",
                height: 1,
                backgroundColor: mainStyles.blackOp(0.07)
              }}
            />
          </div>
        );
      };

      return (
        <div
          style={{
            padding: "0px 50px 20px 50px",
            width: 700,
            margin: "auto"
            // backgroundColor: mainStyles.blueOp(0.05)
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // borderBottom: "1px solid rgba(0,0,0,0.06)",
              paddingBottom: 10
            }}
          >
            <div
              style={{
                fontSize: 18,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                color: mainStyles.black
              }}
            >
              <strong>Upload</strong>{" "}
              <span
                style={{
                  color: mainStyles.blackOp(0.3),
                  fontSize: 14,
                  padding: "0px 5px 0px 5px"
                }}
              >
                a package.json file with one of the methods below to
              </span>
            </div>

            <Button
              id={"generateYourReport"}
              className={disableAnalyze ? null : "pulsingButton"}
              onClick={() => this.handleAnalyze()}
              type="primary"
              disabled={disableAnalyze}
              // size={"medium"}
              style={{
                margin: "0px 5px 0px 5px",
                fontWeight: "bold",
                maxWidth: "300px"
              }}
            >
              generate your report
            </Button>
          </div>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "24px",
              color: mainStyles.blackOp(0.4)
            }}
          >
            <Icon type="arrow-down" />
          </div>

          <div
            style={{
              fontSize: 16,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              color: mainStyles.black,
              padding: "20px 0px 0px 0px"
            }}
          >
            <a
              id={"tryAnExample"}
              style={{ opacity: 0.7 }}
              onClick={() => {
                if (step === 1) {
                  this.onChooseExample();
                }
              }}
            >
              Click here to try an example <code>package.json</code>
            </a>
          </div>
          {renderOrSeparator()}
          {/*<div*/}
          {/*style={{*/}
          {/*fontSize: 16,*/}
          {/*textAlign: "center",*/}
          {/*display: "flex",*/}
          {/*alignItems: "center",*/}
          {/*justifyContent: "center",*/}
          {/*width: "100%",*/}
          {/*color: mainStyles.black,*/}
          {/*padding: "0px 0px 0px 0px"*/}
          {/*}}*/}
          {/*>*/}
          {/*<h5 style={{ margin: 0 }}>Paste Repo URL</h5>*/}
          {/*<Input*/}
          {/*style={{ maxWidth: 400, marginLeft: 5 }}*/}
          {/*value={this.state.repoURL}*/}
          {/*placeholder={"https://github.com/ryanjyost/depchecker-client"}*/}
          {/*onChange={e => this.setState({ repoURL: e.target.value })}*/}
          {/*/>*/}
          {/*</div>*/}
          {/*{renderOrSeparator()}*/}

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
                            ? "check-circle"
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
                        id={"browseFiles"}
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
          {renderOrSeparator()}
          <AceEditor
            value={this.state.packageJSONString}
            fontSize={12}
            mode="json"
            theme="monokai"
            onChange={val => {
              if (!val.length) {
                this.setState({ files: [] });
              }

              let parsedJSON = null;

              try {
                parsedJSON = JSON.parse(val);
              } catch (e) {
                parsedJSON = {};
              }

              this.setState({
                packageJSONString: val,
                packageJSON: parsedJSON
              });
            }}
            name="aceEditor"
            style={{
              width: "100%",
              height: 600,
              marginTop: 20,
              flex: 0.8,
              borderRadius: 3,
              zIndex: 10
            }}
          />
        </div>
      );
    };

    const renderLoading = () => {
      const renderLoadingStep = () => {
        return (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "20px 0px 15px 0px",
                width: 500
              }}
            >
              {step === 2 && (
                <div style={{ marginTop: 10 }}>
                  {!this.state.depBeingAnalyzed ? (
                    "Starting analysis..."
                  ) : (
                    <span>
                      analyzing <strong>{this.state.depBeingAnalyzed}</strong>...
                    </span>
                  )}
                </div>
              )}
              {step === 2 && (
                <div style={{ width: "100%" }}>
                  <Progress
                    format={percent =>
                      `${this.state.depIndex}/${this.state.depsToAnalyze}`
                    }
                    percent={
                      (this.state.depIndex / this.state.depsToAnalyze) * 100
                    }
                    status={step === 2 ? "active" : "normal"}
                  />
                </div>
              )}
            </div>
          </div>
        );
      };
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
          {renderLoadingStep()}
        </div>
      );
    };

    const renderCSVLink = () => {
      return (
        <div>
          <CSVLink
            ref={r => (this.csvLink = r)}
            data={this.state.csvData}
            filename={`${this.state.packageJSON.name}_dependencies`}
            style={{
              display: "flex",
              justifyContent: "center"
            }}
          />
          <Button
            onClick={() => this.prepCSVData()}
            id={"downloadCSV"}
            style={{
              margin: "auto",
              border: "1px solid #217346",
              color: "#217346",
              fontWeight: "bold"
            }}
          >
            Export to CSV
          </Button>
        </div>
      );
    };

    const renderStepsOld = () => {
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
              {step !== 2 && (
                <div
                  style={{
                    fontSize: 18,
                    textAlign: "center",
                    lineHeight: 1.2,
                    marginBottom: 10
                  }}
                >
                  <strong>Relax</strong>{" "}
                  <span style={{ color: mainStyles.blackOp(0.4) }}>
                    while DepChecker does its thing
                  </span>
                </div>
              )}
              {step === 2 && (
                <div style={{ marginTop: 10 }}>
                  {!this.state.depBeingAnalyzed ? (
                    "Starting analysis..."
                  ) : (
                    <span>
                      analyzing <strong>{this.state.depBeingAnalyzed}</strong>...
                    </span>
                  )}
                </div>
              )}
              {step === 2 && (
                <div style={{ width: "100%" }}>
                  <Progress
                    format={percent =>
                      `${this.state.depIndex}/${this.state.depsToAnalyze}`
                    }
                    percent={
                      (this.state.depIndex / this.state.depsToAnalyze) * 100
                    }
                    status={step === 2 ? "active" : "normal"}
                  />
                </div>
              )}
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
                id={"startOver"}
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
            {step !== 3 && (
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
            )}
            {step === 3 && renderCSVLink()}
          </div>
        </div>
      );
    };

    const renderSteps = () => {
      const isFinalStep = step === 3;
      const stepName = (name, isPastOrCurrent, isCurrent) => {
        return (
          <p
            style={{
              marginBottom: 0,
              fontWeight: isCurrent ? "bold" : "normal",
              textAlign: "center",
              color: isCurrent
                ? mainStyles.blackOp(1)
                : isPastOrCurrent
                  ? mainStyles.blackOp(0.6)
                  : mainStyles.blackOp(0.2)
            }}
          >
            {name}
          </p>
        );
      };

      const renderNumber = (num, name, opaque) => {
        const isComplete = step > num;
        const isFuture = step < num;
        const isCurrent = step === num;
        const icons = ["cloud-upload", "coffee", "table"];
        return (
          <div
            onClick={() => {
              if (num === 1 && step === 3) {
                this.handleStartOver();
              }
            }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              margin: "0px 10px",
              cursor: num === 1 ? "pointer" : "default"
            }}
          >
            <Icon
              style={{
                fontSize: 34,
                marginRight: 6,
                color:
                  isComplete || isCurrent
                    ? mainStyles.blue
                    : mainStyles.blackOp(0.1)
              }}
              type={icons[num - 1]}
            />

            {stepName(name, step >= num, step === num)}
          </div>
        );
      };

      const line = isBlue => {
        return (
          <div
            style={{
              width: 100,
              borderRadius: 5,
              height: 1,
              backgroundColor: isBlue
                ? mainStyles.blueOp(1)
                : mainStyles.blackOp(0.07)
            }}
          />
        );
      };

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: isFinalStep ? 20 : "20px 20px 40px 20px",
            overflowX: "hidden",
            width: "100%",
            zIndex: 10
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              width: 600,
              maxWidth: "100%"
            }}
          >
            {isFinalStep ? (
              <Button
                onClick={() => this.handleStartOver()}
                type="primary"
                size={"small"}
                style={{
                  fontWeight: "bold",
                  maxWidth: "300px",
                  margin: "0px 10px"
                }}
              >
                Start Over
              </Button>
            ) : (
              renderNumber(1, "Upload")
            )}
            {line(step > 1)}
            {renderNumber(2, "Relax")}
            {line(step === 3)}
            {renderNumber(3, "Analyze")}
          </div>
        </div>
      );
    };

    const renderResults = () => {
      const columns = buildColumns(packageJSON, mainStyles);

      switch (this.state.activeTab) {
        case "all":
          return (
            <ReactTable
              ref={r => (this.allDepsTable = r)}
              filterable
              data={[...dependencies, ...devDeps]}
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

        case "deps":
          return (
            <ReactTable
              ref={r => (this.depsTable = r)}
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
        case "devDeps":
          return (
            <ReactTable
              ref={r => (this.devDepsTable = r)}
              filterable
              data={devDeps}
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
      }
    };

    const renderTabs = () => {
      return (
        <Tabs
          animated={false}
          activeKey={this.state.activeTab}
          onChange={key => this.setState({ activeTab: key })}
        >
          <TabPane
            tab={`All Deps (${this.state.dependencies.length +
              this.state.devDeps.length})`}
            key="all"
            id={"allDepsTab"}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  marginBottom: 10,
                  justifyContent: "flex-end"
                }}
              >
                {renderCSVLink()}
              </div>
              {renderResults("all")}
            </div>
          </TabPane>
          <TabPane
            tab={`Deps (${this.state.dependencies.length})`}
            key="deps"
            id={"depsTab"}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  marginBottom: 10,
                  justifyContent: "flex-end"
                }}
              >
                {renderCSVLink()}
              </div>
              {renderResults()}
            </div>
          </TabPane>
          <TabPane
            tab={`Dev Deps (${this.state.devDeps.length})`}
            key="devDeps"
            id={"devDepsTab"}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  marginBottom: 10,
                  justifyContent: "flex-end"
                }}
              >
                {renderCSVLink()}
              </div>
              {renderResults(true)}
            </div>
          </TabPane>
          <TabPane tab="Summary" key="summary" id={"summaryReportTab"}>
            Coming Soon!
          </TabPane>
          <TabPane tab="Past Reports" key="old" id={"oldReportsTab"}>
            Coming Soon!
          </TabPane>
        </Tabs>
      );
    };

    return (
      <div
        style={{
          width: "100%",
          paddingBottom: 100,
          minHeight: "100vh"
        }}
      >
        {/*<SimpleStorage parent={this} />*/}
        <Header styles={mainStyles} showContactText />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "auto"
          }}
        >
          {renderSteps()}
          <div
            style={{
              width: "94%"
            }}
          >
            {step === 1 && renderUpload()}
            {step === 2 && renderLoading()}
            {step === 3 && renderTabs()}
          </div>
        </div>
      </div>
    );
  }
}
