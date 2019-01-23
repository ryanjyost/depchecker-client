import React, { Component } from "react";
import PackageDetails from "./components/PackageDetails";
import axios from "axios";
import { Checkbox, Button, Card } from "antd";
import ReactTable from "react-table";
import "react-table/react-table.css";
import SimpleStorage from "react-simple-storage";
import _ from "underscore";
import moment from "moment/moment";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

const CheckboxGroup = Checkbox.Group;

class App extends Component {
  constructor(props) {
    super(props);

    this.client = axios.create({
      baseURL:
        process.env.REACT_APP_API_URL || "https://dpechecker.herokuapp.com",
      timeout: 3 * 60 * 1000,
      headers: { Accept: "application/json" }
    });

    this.state = {
      view: 1,
      token: "",
      reposForChoosing: [],
      checkedRepos: [],
      repos: [],
      analyzingRepos: false,
      selectedRepo: null
    };
    this.bitbucketLogin = this.bitbucketLogin.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    if (window.location.search) {
      let code = window.location.search.replace("?code=", "");
      if (code) {
        this.authBitbucket(code);
      }
    }
  }

  checkTokenAndUser() {}

  bitbucketLogin() {
    window.location = `https://bitbucket.org/site/oauth2/authorize?client_id=${
      process.env.REACT_APP_BITBUCKET_CLIENT_ID
    }&response_type=code`;
    // window.location = `https://bitbucket.org/site/oauth2/authorize?client_id=${
    //   process.env.REACT_APP_BITBUCKET_CLIENT_ID
    // }&response_type=code&prompt=consent`;
  }

  authBitbucket(code) {
    this.client
      .post("/bitbucket/oauth", {
        code: code
      })
      .then(response => {
        this.setState({
          token: response.data.oauth.access_token,
          user: response.data.user
        });

        this.getRepos(response.data.oauth.access_token, response.data.user);
      })
      .catch(error => {
        console.log(error);
      });
  }

  getRepos(token, user) {
    this.client
      .post("/bitbucket/get_user_repos", {
        access_token: token,
        user: user
      })
      .then(response => {
        this.setState({
          reposForChoosing: response.data.repos,
          view: 2
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  analyzeRepos() {
    this.setState({ view: 3, analyzingRepos: true });
    const reposToSend = this.state.reposForChoosing.filter(repo => {
      return this.state.checkedRepos.indexOf(repo.name) > -1;
    });
    this.client
      .post("/bitbucket/onboard_new_user", {
        access_token: this.state.token,
        user: this.state.user,
        repos: reposToSend
      })
      .then(response => {
        console.log(response.data.repos[0]);
        this.setState({ repos: response.data.repos, analyzingRepos: false });
      })
      .catch(error => {
        console.log(error);
      });
  }

  logout() {
    this.setState({ isAuthenticated: false, token: "", user: null });
  }

  render() {
    let content = <div>hey</div>;
    const {
      view,
      reposForChoosing,
      repos,
      analyzingRepos,
      selectedRepo
    } = this.state;

    const renderTable = () => {
      const columns = [
        {
          Header: "Name",
          accessor: "name",
          Cell: props => {
            return <div>{props.value}</div>;
          }
        },
        {
          Header: "Versions Behind",
          id: "project_ver",
          style: { textAlign: "center" },
          accessor: "name",
          Cell: props => {
            const currentProjectVersion = selectedRepo.dependencies[
              props.value
            ].replace(/[\^~]/g, "");
            const levels = currentProjectVersion.split(".");

            var versionsArray = [];
            _.forEach(props.original.versions, function(e, k) {
              versionsArray.push(k);
            });

            const currentVersionBreakdown = {
              major: levels[0],
              minor: levels[1],
              patch: levels[2]
            };

            const mostRecentReleaseBreakdown = {
              major: versionsArray[versionsArray.length - 1].split(".")[0],
              minor: versionsArray[versionsArray.length - 1].split(".")[1],
              patch: versionsArray[versionsArray.length - 1].split(".")[2]
            };

            const versionsBehind = {
              major:
                mostRecentReleaseBreakdown.major -
                currentVersionBreakdown.major,
              minor:
                mostRecentReleaseBreakdown.minor -
                currentVersionBreakdown.minor,
              patch:
                mostRecentReleaseBreakdown.patch - currentVersionBreakdown.patch
            };

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

            return <span>{text}</span>;
          }
        },
        {
          Header: "Releases Behind",
          id: "release",
          style: { textAlign: "center" },
          accessor: "name",
          Cell: props => {
            const currentProjectVersion = selectedRepo.dependencies[
              props.value
            ].replace(/[\^~]/g, "");

            var versionsArray = [];
            _.forEach(props.original.versions, function(e, k) {
              versionsArray.push(k);
            });

            const releasesBehind =
              versionsArray.length -
              1 -
              versionsArray.indexOf(currentProjectVersion);

            return (
              <span>
                {releasesBehind === 0
                  ? "Up to date"
                  : `${releasesBehind} ${
                      releasesBehind === 1 ? "release" : "releases"
                    }`}
              </span>
            );
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
          data={selectedRepo.deps}
          columns={columns}
          style={{ width: "100%" }}
          defaultFilterMethod={(filter, row, column) => {
            const id = filter.pivotId || filter.id;
            return row[id] !== undefined
              ? String(row[id]).startsWith(filter.value)
              : true;
          }}
          SubComponent={row => (
            <PackageDetails row={row} dep={row.original} repo={selectedRepo} />
          )}
          className={"-highlight"}
        />
      );
    };

    switch (view) {
      case 1:
        content = (
          <Button
            type="primary"
            onClick={this.bitbucketLogin}
            className="button"
          >
            Connect to Bitbucket
          </Button>
        );
        break;
      case 2:
        content = (
          <div>
            <div>
              <Button>Check all</Button>
              <Button>Uncheck all</Button>
            </div>
            <CheckboxGroup
              // options={repos}
              onChange={values => this.setState({ checkedRepos: values })}
            >
              <div>
                {reposForChoosing.map((repo, i) => {
                  return (
                    <Checkbox
                      key={repo.name}
                      value={repo.name}
                      style={{ display: "block", marginLeft: 0 }}
                    >
                      {repo.name}{" "}
                      <span>{repo.is_private ? "private" : "public"}</span>
                    </Checkbox>
                  );
                  // return <Checkbox value={"a"}>{"a"}</Checkbox>;
                })}
              </div>
            </CheckboxGroup>
            <div>
              <Button type={"primary"} onClick={() => this.analyzeRepos()}>
                Submit
              </Button>
            </div>
          </div>
        );
        break;
      case 3:
        let reposToShow = analyzingRepos ? reposForChoosing : repos;
        content = (
          <div>
            {reposToShow.map((repo, i) => {
              return (
                <Card
                  onClick={() =>
                    this.setState({ selectedRepo: repo, view: "singleRepo" })
                  }
                  style={{ cursor: "pointer" }}
                  key={i}
                >
                  {repo.name}
                </Card>
              );
            })}
          </div>
        );
        break;
      case "singleRepo":
        content = (
          <div style={{ width: "100%", padding: "10px 20px" }}>
            {selectedRepo.name}
            {renderTable()}
          </div>
        );
        break;
      default:
        break;
    }

    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/*<SimpleStorage parent={this} />*/}
        {content}
      </div>
    );
  }
}

export default App;
