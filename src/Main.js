import React, { Component } from "react";
import AceEditor from "react-ace";
import Results from "./components/Results";
import "brace/mode/json";
import "brace/theme/monokai";
import Dropzone from "react-dropzone";
import { Button, Icon, Spin, Progress } from "antd";
import axios from "axios";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import PackageDetails from "./components/PackageDetails";
import { CSVLink, CSVDownload } from "react-csv";
import ExampleJSON from "./example.json";
import socketIOClient from "socket.io-client";
import Analyze from "./components/Analyze";

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
      packageJSONString:
        "...or simple paste your package.json file contents here...",
      csvData: [],
      twitterLink: null,
      response: false,
      endpoint: "http://localhost:5000",
      depBeingAnalyzed: "",
      depIndex: 0,
      depsToAnalyze: 0
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
      console.log(data);
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
    console.log("HANDLE");
    this.socket.emit("analyze", this.state.packageJSON);
    this.setState({
      step: 2,
      depsToAnalyze: Object.keys(this.state.packageJSON.dependencies).length
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

    const disableAnalyze =
      !("dependencies" in this.state.packageJSON) || step !== 1;

    const renderUpload = () => {
      const baseStyle = {
        borderWidth: 2,
        borderColor: "rgba(0,0,0,0.05)",
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

      return (
        <div
          style={{
            padding: "20px 50px",
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
              marginBottom: 40
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center"
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
                  a package.json file to
                </span>
              </div>
            </div>

            <Button
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
            {!this.state.packageJSON.name && (
              <div
                style={{ color: mainStyles.blackOp(0.3), margin: "0px 5px" }}
              >
                or
              </div>
            )}

            {!this.state.packageJSON.name && (
              <a
                style={{ opacity: 0.7 }}
                onClick={() => {
                  if (step === 1) {
                    this.onChooseExample();
                  }
                }}
              >
                try an example
              </a>
            )}
          </div>
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
                        className={"pulsingButton"}
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
            fontSize={12}
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
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Button
            style={{
              margin: "auto",
              border: "1px solid #217346",
              color: "#217346",
              fontWeight: "bold"
            }}
          >
            <Icon type="download" style={{ marginRight: 3 }} />Download CSV File
          </Button>
        </CSVLink>
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

      const stepName = (name, isPastOrCurrent) => {
        return (
          <h5
            style={{
              paddingTop: 3,
              color: isPastOrCurrent
                ? mainStyles.blackOp(0.6)
                : mainStyles.blackOp(0.2)
            }}
          >
            {name}
          </h5>
        );
      };

      const renderNumber = (num, name, opaque) => {
        const isComplete = step > num;
        const icons = ["cloud-upload", "coffee", "table"];
        return (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              position: "relative"
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 50,
                zIndex: 1,
                backgroundColor:
                  num > step
                    ? "#e5e5e5"
                    : step > num
                      ? "#52c41a"
                      : mainStyles.blueOp(1),
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: "bold",
                opacity: opaque ? 0.3 : 1
              }}
            >
              <Icon
                style={{
                  fontSize: 20
                }}
                type={isComplete ? "check" : icons[num - 1]}
              />
            </div>
            {stepName(name, step >= num)}
            {num === 2 && line()}
          </div>
        );
      };

      const line = isBlue => {
        return (
          <div
            style={{
              width: "200vw",
              height: 2,
              position: "absolute",
              top: 18,
              left: "-50vw",
              backgroundColor: isBlue
                ? mainStyles.blueOp(1)
                : mainStyles.blackOp(0.04)
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
            padding: "40px 20px 10px 20px",
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
              width: 340
            }}
          >
            {renderNumber(1, "Upload")}
            {renderNumber(2, "Relax")}
            {renderNumber(3, "Analyze & Export")}
          </div>
        </div>
      );
    };

    return (
      <div
        style={{
          minWidth: 800,
          width: "100%",
          backgroundColor: mainStyles.blueOp(0.03)
        }}
      >
        <div
          style={{
            minWidth: 800,
            width: "100%",
            height: "100px",
            position: "absolute",
            backgroundColor: "#fff",
            top: 0,
            zIndex: 0
          }}
        />
        <div
          style={{
            height: 40,
            width: "100%",
            // borderBottom: `2px solid ${mainStyles.blackOp(0.05)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 40px",
            opacity: 0.99
          }}
        >
          <div style={{ fontSize: 16, fontWeight: "bold" }}>DepChecker</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: 5, color: "#a4a4a4" }}>
              Bug? Question? Feature request?
            </div>
            <a href={"mailto:ryanjyost@gmail.com?subject=DepChecker"}>
              Get in touch
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/*<Button size={"small"} style={{ marginRight: 10 }}>*/}
            {/*Report a bug*/}
            {/*</Button>*/}
            <div style={{ marginRight: 5, color: "#a4a4a4" }}>Made by</div>
            <a href={"https://ryanjyost.com"} target={"_blank"}>
              Ryan
            </a>
          </div>
        </div>
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
            {step === 3 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    marginBottom: 10,
                    justifyContent: "space-between"
                  }}
                >
                  <Button
                    className={"pulsingButton"}
                    onClick={() => this.handleStartOver()}
                    type="primary"
                    style={{
                      fontWeight: "bold",
                      maxWidth: "300px"
                    }}
                  >
                    Start Over
                  </Button>
                  {renderCSVLink()}
                </div>
                <Results
                  packageJSON={packageJSON}
                  dependencies={dependencies}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
