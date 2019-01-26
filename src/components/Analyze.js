import React, { Component } from "react";
import { Progress } from "antd";
import analyzeSingleDependency from "../lib/analyzeSingleDependency";
import to from "../lib/to";

export default class Analyze extends Component {
  constructor(props) {
    super(props);
    this.state = {
      depBeingAnalyzed: "",
      depIndex: 0,
      depsToAnalyze: 0,
      arrayOfDepsToAnalyze: []
    };
  }

  componentDidMount() {
    let arrayOfDepsToAnalyze = [],
      numDepsToAnalyze = 0;
    for (let key in this.props.packageJSON.dependencies) {
      arrayOfDepsToAnalyze.push({
        name: key,
        version: this.props.packageJSON.dependencies[key]
      });
      numDepsToAnalyze++;
    }

    console.log(arrayOfDepsToAnalyze);

    this.setState({
      depsToAnalyze: numDepsToAnalyze,
      arrayOfDepsToAnalyze
    });

    this.analyzeSingleDep(arrayOfDepsToAnalyze[0]);
  }

  async analyzeSingleDep(dep) {
    let err, depData;
    [err, depData] = await to(analyzeSingleDependency(dep));

    console.log("DEP DATA", depData);

    this.setState({
      depIndex: this.state.depIndex + 1
    });
  }

  render() {
    const { step, mainStyles } = this.props;
    return (
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
              percent={(this.state.depIndex / this.state.depsToAnalyze) * 100}
              status={step === 2 ? "active" : "normal"}
            />
          </div>
        )}
      </div>
    );
  }
}
