import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Icon } from "antd";
import ROUTES from "../../lib/routes";

import Header from "../Header";

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { styles } = this.props;

    const renderMenu = () => {
      const items = [{ text: "" }];
    };

    const First = ({ styles }) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <div style={{ flex: 1, padding: "40px 20px 0px 20px" }}>
            <h1
              style={{
                fontSize: 32,
                lineHeight: 1.2,
                fontWeight: "900",
                color: styles.blackOp(0.95),
                paddingRight: 20
              }}
            >
              Maintaining client JavaScript projects?
            </h1>
            <h2
              style={{
                lineHeight: 1.4,
                color: styles.blackOp(0.8),
                fontSize: 18,
                marginBottom: 20,
                paddingRight: 20
              }}
            >
              Quickly and easily discover dependency management opportunities
              that lead to better software, more billable hours and happier
              clients.
            </h2>
            <Link to={ROUTES.APP}>
              <Button
                id={`ctaTopLanding`}
                size={"large"}
                type={"primary"}
                className={"pulsingButton"}
                style={{ marginBottom: 10 }}
              >
                <span style={{ paddingRight: 8, fontWeight: "bold" }}>
                  Analyze a <code style={{ color: "#fff" }}>package.json</code>
                </span>{" "}
                &rarr;
              </Button>
            </Link>
            <h5
              style={{
                paddingLeft: 5,
                color: styles.blackOp(0.4),
                maxWidth: 300
              }}
            >
              No need to provide email, payment or spare kidney for Beta
              version.
            </h5>
          </div>
          <div style={{ flex: 1.3, padding: 10 }}>
            <BrowserPreview styles={styles} isMain>
              <img src={"/images/landing-preview.png"} width={"100%"} />
            </BrowserPreview>
          </div>
        </div>
      );
    };

    const BrowserPreview = ({ children, isMain, styles }) => {
      const Dot = ({ isLeft }) => {
        return (
          <div
            style={{
              height: 8,
              width: 8,
              backgroundColor: styles.blackOp(0.06),
              borderRadius: 10,
              margin: isLeft ? "0px 3px 0px 6px" : "0px 3px"
            }}
          />
        );
      };

      return (
        <div
          style={{
            borderRadius: 3,
            margin: "auto",
            display: "block",
            boxShadow: `0 20px 40px 0 ${styles.blackOp(0.3)}`,
            border: "2px solid rgba(0,0,0,0.05)",
            minWidth: isMain ? 300 : null,
            maxWidth: isMain ? null : null,
            width: "100%"
          }}
        >
          <div
            style={{
              width: "100%",
              borderTopRightRadius: 3,
              borderTopLeftRadius: 3,
              backgroundColor: "#f0f2f5",
              height: 20,
              display: "flex",
              alignItems: "center"
            }}
          >
            <Dot isLeft /> <Dot /> <Dot />
          </div>

          {children}
        </div>
      );
    };

    const Features = ({ styles }) => {
      const isWide = styles.windowWidth > 700;

      const renderSingleFeature = (title, desc, img) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: isWide ? "row" : "column-reverse",
              width: "100%",
              maxWidth: 1000,
              padding: isWide ? "50px 20px" : "50px 0px"
            }}
          >
            <BrowserPreview styles={styles}>
              <img src={img} width={"100%"} />
            </BrowserPreview>
            <div
              style={{
                margin: isWide ? "20px 40px 20px 40px" : "20px 20px 20px 20px",
                fontSize: 18,
                flex: 1.7,
                minWidth: isWide ? 400 : 300
              }}
            >
              <h3
                style={{
                  marginBottom: 10,
                  color: styles.blackOp(0.6),
                  lineHeight: 1.2
                }}
              >
                <strong style={{ color: styles.blackOp(0.8) }}>{title} </strong>
              </h3>
              <div style={{ marginBottom: 0, color: styles.blackOp(0.6) }}>
                {desc}
              </div>
            </div>
          </div>
        );
      };

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%"
          }}
        >
          <SectionHeader>
            This is the part where I show you some features
          </SectionHeader>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              justifyContent: "center",
              width: "100%",
              flexWrap: "wrap"
            }}
          >
            {renderSingleFeature(
              <span>Drag n' drop? Or copy n' paste?</span>,
              <div>
                <div style={{ paddingBottom: 10 }}>
                  That's the hardest decision you'll need to make to get
                  started.
                </div>
                On the other hand, installing and integrating complex CI/CD
                tools costs time and big bucks. It's overkill for most projects.
                With DepChecker, all you need is the contents of a{" "}
                <code>package.json</code> file.
              </div>,
              `/images/landing-1.png`
            )}

            {renderSingleFeature(
              <span>Organized interface for efficient analysis</span>,
              <span>
                See everything clearly in one central, sortable and filterable
                table. No more headaches from messy command line outputs. No
                more jumping from browser to terminal to project and back again.
              </span>,
              `/images/landing-2.png`
            )}

            {renderSingleFeature(
              <span>Aggregated data, stats and links</span>,
              <div>
                DepChecker collects the information you need to make good
                dependency decisions in seconds. View GitHub stars, project
                license, weekly download counts, last publish, and more. Oh, and
                quick links to everything that matters.
              </div>,
              `/images/landing-3.png`
            )}

            {renderSingleFeature(
              <span>Export to CSV</span>,
              <span>
                Share the report with clients to spark conversations. Include it
                in proposals and SOWs. Because sometimes you just need a good
                old-fashioned spreadsheet.
              </span>,
              `/images/landing-4.png`
            )}
          </div>
        </div>
      );
    };

    const Benefits = ({ styles }) => {
      const renderSingleBenefit = (title, desc, icon) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexDirection: "column",
              maxWidth: 300,
              width: "100%",
              padding: 20
            }}
          >
            <Icon
              style={{
                fontSize: 40,
                color: styles.blue,
                margin: "2px 5px"
              }}
              type={icon}
            />

            <div style={{ margin: "20px 0px 0px 0px", fontSize: 18 }}>
              <h4
                style={{
                  marginBottom: 10,
                  color: styles.blackOp(0.6),
                  lineHeight: 1.2
                }}
              >
                <strong style={{ color: styles.blackOp(0.8) }}>{title} </strong>
              </h4>
              <h5 style={{ marginBottom: 0, color: styles.blackOp(0.6) }}>
                {desc}
              </h5>
            </div>
          </div>
        );
      };

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%"
          }}
        >
          <SectionHeader>It's a small tool with big benefits</SectionHeader>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              justifyContent: "center",
              width: "100%",
              flexWrap: "wrap"
            }}
          >
            {renderSingleBenefit(
              "Save developer time",
              <span>
                Don't waste any more developer time on trivial information
                gathering. Just upload a <code>package.json</code> file and get
                actionable insights in seconds.
              </span>,
              "clock-circle"
            )}
            {renderSingleBenefit(
              "Increase billable hours",
              `Use the time you save to refactor for version upgrades, remove dependencies with non-commercial licenses, replace unmaintained open source solutions, and more...`,
              "line-chart"
            )}
            {renderSingleBenefit(
              "Deliver higher-quality software",
              `DepChecker helps you monitor and keep well-maintained projects. That means fewer bugs, surprises and cranky clients.`,
              "code"
            )}
            {renderSingleBenefit(
              "Avoid maintenance fire drills ",
              `By proactively reviewing dependencies, you'll update and refactor before one of myriad inevitable issues gives you no other choice at an inopportune time.`,
              "code"
            )}
            {renderSingleBenefit(
              `Make your clients happier`,
              `Clients like to know they're being taken care of. Give them peace of mind through regular dependency management.`,
              "team"
            )}
          </div>
        </div>
      );
    };

    const HowItWorks = ({ styles }) => {
      const isWide = styles.windowWidth > 700;

      const renderSection = (step, text, icon) => {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <Icon
                style={{
                  fontSize: 60,
                  color: styles.blue,
                  margin: "2px 5px"
                }}
                type={icon}
              />
            </div>
            <div
              style={{
                margin: "20px 0px 0px 0px",
                fontSize: 18,
                textAlign: "center"
              }}
            >
              <h2
                style={{
                  marginBottom: 5,
                  color: styles.blackOp(0.95),
                  fontSize: 20,
                  fontWeight: "900"
                }}
              >
                {step}
              </h2>
              <h5 style={{ marginBottom: 0, color: styles.blackOp(0.6) }}>
                {text}
              </h5>
            </div>
          </div>
        );
      };

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <SectionHeader> There's nothing to setup or install</SectionHeader>
          <div
            style={{
              display: "flex",
              flexDirection: isWide ? "row" : "column",
              justifyContent: isWide ? "space-between" : "center",
              alignItems: "center",
              width: "100%",
              maxWidth: 700,
              marginTop: 30
            }}
          >
            {renderSection("Upload", "a package.json file", "cloud-upload")}
            <h2 style={{ color: styles.blackOp(0.4), margin: "20px 0px" }}>
              {isWide ? <span>&rarr;</span> : <span>&darr;</span>}
            </h2>
            {renderSection(
              "Relax",
              "while DepChecker does its thing",
              "coffee"
            )}
            <h2 style={{ color: styles.blackOp(0.4), margin: "20px 0px" }}>
              {isWide ? <span>&rarr;</span> : <span>&darr;</span>}
            </h2>
            {renderSection(
              "Analyze & Export",
              "your dependency report",
              "table"
            )}
          </div>
        </div>
      );
    };

    const Explanation = ({ styles }) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column"
          }}
        >
          <SectionHeader>
            Find valuable work to be done in seconds.
          </SectionHeader>
          <div
            style={{
              maxWidth: 700
            }}
          >
            <h3
              style={{
                marginBottom: 20,
                textAlign: "center",
                color: styles.blackOp(0.9)
              }}
            >
              DepChecker analyzes <code>package.json</code> files to generate
              insightful and exportable dependency reports. It helps software
              consultants with ongoing maintenance engagements deliver more and
              higher quality services to their clients.
            </h3>
          </div>
        </div>
      );
    };

    const BehindTheCurtain = ({ styles }) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column"
          }}
        >
          <SectionHeader>
            Don't see the features you need? Just ask.
          </SectionHeader>
          <div
            style={{
              maxWidth: 700
            }}
          >
            <h3
              style={{
                marginBottom: 20,
                textAlign: "center",
                color: styles.blackOp(0.9)
              }}
            >
              This is the absolute minimal version of a product being built by
              me,{" "}
              <a href="https://ryanjyost.com" target={"_blank"}>
                Ryan
              </a>{" "}
              👋. I'm the only one working on DepChecker, which means the
              feedback loop is as short as it gets.
            </h3>
            <h3
              style={{
                marginBottom: 20,
                textAlign: "center",
                color: styles.blackOp(0.9)
              }}
            >
              <a href={"mailto:ryan@depchecker.com"}>Shoot me an email </a> with
              your feature needs, dependency management pain points, unrelenting
              feedback, etc. and we'll chat about how to make DepChecker more
              helpful to you.
            </h3>
          </div>
        </div>
      );
    };

    const SectionHeader = ({ children }) => {
      return (
        <h1
          style={{
            textAlign: "center",
            fontWeight: "900",
            display: "inline-block",
            padding: "0px 30px 5px 30px",
            color: styles.blackOp(1),
            fontSize: 26,
            marginBottom: 10
          }}
        >
          {children}
        </h1>
      );
    };

    const SectionSubHeader = ({ children }) => {
      return (
        <h3
          style={{
            textAlign: "center",
            fontWeight: "bold",
            display: "inline-block",
            padding: "0px 30px 5px 30px",
            marginBottom: 40,
            color: "rgba(0,0,0,0.95)"
          }}
        >
          {children}
        </h3>
      );
    };

    const Last = () => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: styles.blueOp(1),
            padding: "50px 20px",
            borderRadius: 5,
            maxWidth: 800,
            margin: "auto"
          }}
        >
          <SectionHeader>
            <span style={{ color: "#fff" }}>
              If it saves you an hour...why not?
            </span>
          </SectionHeader>
          <Link to={ROUTES.APP}>
            <Button
              id={`ctaBottomLanding`}
              size={"large"}
              type={"default"}
              style={{ marginTop: 20 }}
            >
              <span style={{ paddingRight: 8, fontWeight: "bold" }}>
                Analyze a <code>package.json</code>
              </span>{" "}
              &rarr;
            </Button>
          </Link>
        </div>
      );
    };

    return (
      <div
        style={{
          maxWidth: 1100,
          minHeight: "100vh",
          width: "100%",
          margin: "auto"
        }}
      >
        <Header styles={styles} />
        <div style={{ padding: "50px 20px 50px 20px" }}>
          <First styles={styles} />
        </div>
        <div
          style={{
            padding: "100px 20px 100px 20px",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Explanation styles={styles} />
        </div>
        <div style={{ padding: "50px 20px 150px 20px" }}>
          <HowItWorks styles={styles} />
        </div>
        <div style={{ padding: "50px 20px 50px 20px" }}>
          <Benefits styles={styles} />
        </div>
        <div style={{ padding: "100px 20px 100px 20px" }}>
          <Features styles={styles} />
        </div>
        <div style={{ padding: "50px 20px 100px 20px" }}>
          <BehindTheCurtain styles={styles} />
        </div>
        <div style={{ padding: "50px 20px 100px 20px" }}>
          <Last styles={styles} />
        </div>
      </div>
    );
  }
}
