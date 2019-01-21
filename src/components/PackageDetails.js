import React, { Component } from "react";
import { Checkbox, Button, Card, Icon } from "antd";
import moment from "moment";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import axios from "axios";
import numeral from "numeral";

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

export default class PackageDetails extends Component {
  render() {
    const { dep, repo } = this.props;
    console.log(dep);

    const renderDetail = (label, data) => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "5px 20px"
          }}
        >
          <div style={{ color: "#888", marginRight: 5 }}>{label}</div>{" "}
          <div style={{ fontWeight: "bold", fontSize: 18 }}>{data}</div>
        </div>
      );
    };

    const renderLinks = () => {
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
          label: "Github Repo",
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
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 0
          }}
        >
          <h1 style={{ margin: 5, marginRight: 15 }}>{dep.name}</h1>
          {links.map(link => {
            if (!link.href) {
              return null;
            } else {
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={"_blank"}
                  style={{ margin: 5 }}
                >
                  <Button>{link.label}</Button>
                </a>
              );
            }
          })}
        </div>
      );
    };

    const renderVersionDetails = () => {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          {renderDetail("Versions Behind", dep.versionsBehindText)}
          {renderDetail("package.json", repo.dependencies[dep.name])}
          {renderDetail("latest", dep["dist-tags"].latest)}
          {"lts" in dep["dist-tags"] &&
            renderDetail("LTS", dep["dist-tags"].lts)}
          {renderDetail(
            "last publish",
            timeAgo.format(moment(dep.time[dep["dist-tags"].latest]).toDate())
          )}
          {renderDetail(
            "weekly downloads",
            numeral(dep.downloads.weekly.downloads).format("0,0")
          )}
          {"open_issues_count" in dep &&
            renderDetail(
              "open issues & PRs",
              numeral(dep.open_issues_count).format("0,0")
            )}
        </div>
      );
    };

    return (
      <div
        style={{
          width: "100%",
          flexWrap: "wrap"
        }}
      >
        <Card
          style={{
            width: "100%",
            border: "none",
            borderBottom: `1px solid ${this.props.mainStyles.blackOp(0.05)}`,
            // backgroundColor:
            //   this.props.index % 2 === 0
            //     ? this.props.mainStyles.blackOp(0.02)
            //     : this.props.mainStyles.blackOp(0.02)
            backgroundColor: this.props.mainStyles.whiteOp(0.8)
          }}
        >
          {renderLinks()}
          {renderVersionDetails()}
        </Card>
      </div>
    );
  }
}
