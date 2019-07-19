
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import { config } from "./config";
import './css/dashboard.css';
import Deployment from "./models/Deployment";
import AzureDevOpsPipeline from "./models/pipeline/AzureDevOpsPipeline";
import { GitHub } from './models/repository/GitHub';
import { Repository } from './models/repository/Repository';

export interface IDashboardState{
  deployments: Deployment[],
  manifestSync: string
}
class Dashboard extends React.Component<{}, IDashboardState> {
  constructor(props:{}) {
    super(props);
    this.state = {
      deployments: [],
      manifestSync: ""
    };
    this.getDeployments();
  }
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Container Journey Prototype</h1>
        </header>
        {this.renderPrototypeTable()}
      </div>
    );
  }

  public renderPrototypeTable = () => {
    if (this.state.deployments.length === 0) {
      return <Spinner size={SpinnerSize.large} />;
    }
    const rows = [] as any[];
    let counter = 0;
    const manifestSyncCommit = this.state.manifestSync;
    this.state.deployments.forEach((deployment) => {
      rows.push(<tr key={counter}>
                  <td>{deployment.srcToDockerBuild ? <a href={deployment.srcToDockerBuild.sourceVersionURL}>{deployment.commitId}</a> : "-" }</td>
                  <td>{deployment.srcToDockerBuild ? <a href={deployment.srcToDockerBuild.URL}>{deployment.srcToDockerBuild.id}</a> : "-"}</td>
                  <td>{deployment.srcToDockerBuild ? this.getIcon(deployment.srcToDockerBuild.result) : "-"}</td>
                  <td>{deployment.srcToDockerBuild ? deployment.srcToDockerBuild.startTime.toLocaleString() : "-"}</td>
                  <td>{deployment.srcToDockerBuild ? deployment.srcToDockerBuild.sourceBranch.replace("refs/heads/", "") : "-"}</td>
                  <td>{deployment.imageTag}</td>
                  <td>{deployment.dockerToHldRelease ? <a href={deployment.dockerToHldRelease.URL}>{deployment.dockerToHldRelease!.id}</a> : "-"}</td>
                  <td>{deployment.dockerToHldRelease ? this.getIcon(deployment.dockerToHldRelease!.status) : "-"}</td>
                  <td>{deployment.hldToManifestBuild ? <a href={deployment.hldToManifestBuild.sourceVersionURL}>{deployment.hldCommitId}</a> : deployment.hldCommitId}</td>
                  <td>{deployment.hldToManifestBuild ? <a href={deployment.hldToManifestBuild.URL}>{deployment.hldToManifestBuild!.id}</a> : "-"}</td>
                  <td>{deployment.hldToManifestBuild ? this.getIcon(deployment.hldToManifestBuild!.result) : "-"}</td>
                  <td>{deployment.hldToManifestBuild ? (Number.isNaN(deployment.hldToManifestBuild!.finishTime.valueOf()) ? "-" : deployment.hldToManifestBuild!.finishTime.toLocaleString()) : "-"}</td>
                  <td>{deployment.duration()} minutes</td>
                  <td>{deployment.status()}</td>
                  <td>{deployment.manifestCommitId === manifestSyncCommit ? "Synced" : ""}</td>
                </tr>);
        counter++;
    });
    return (<table>
          <thead>
            <tr>
              <th>Commit</th>
              <th>SRC to ACR</th>
              <th>Result</th>
              <th>Start Time</th>
              <th>Source Branch</th>
              <th>Image Version</th>
              <th>ACR to HLD</th>
              <th>Result</th>
              <th>Commit</th>
              <th>HLD to Manifest</th>
              <th>Result</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Cluster Sync</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>);
  
  }

  public getDeployments = () => {
    const srcPipeline = new AzureDevOpsPipeline("epicstuff", "hellobedrock", 101);
    const hldPipeline = new AzureDevOpsPipeline("epicstuff", "hellobedrock", 1, true);
    const clusterPipeline = new AzureDevOpsPipeline("epicstuff", "hellobedrock", 102);
    const manifestRepo: Repository = new GitHub(config.GITHUB_USERNAME, config.GITHUB_MANIFEST);
    Deployment.getDeployments("hello-bedrock", srcPipeline, hldPipeline, clusterPipeline, (deployments: Deployment[]) => {
      this.setState({deployments,
                     manifestSync: manifestRepo.manifestSync});
    });
    return <div />;
  }

  private getIcon(status: string): React.ReactElement {
    if(status === "succeeded") {
      return <Icon style={{color: "green"}} iconName="CompletedSolid" />;
    } else if (status === undefined || status === "inProgress") {
      return <Icon style={{color: "blue"}} iconName="SkypeCircleClock" />; // SyncStatusSolid
    }
    return <Icon style={{color: "#c80000"}} iconName="StatusErrorFull" />;
  }
}

export default Dashboard;
