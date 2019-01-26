import axios from "axios";
import to from "./to.js";

export default async function(dep) {
  let err, registryResponse, finalDepData;
  [err, registryResponse] = await to(
    axios.get(`https://registry.npmjs.org/${dep}/`)
  );

  if (err) {
    console.log("eRROr");
  } else {
    finalDepData = { ...registryResponse.data };
  }

  // get issues
  let issuesResponse;
  if (finalDepData.repository) {
    const issuesURL = `https://api.github.com/repos/${finalDepData.repository.url
      .split("github.com/")[1]
      .replace(".git", "")}?client_id=${
      process.env.REACT_APP_GITHUB_CLIENT_ID
    }&client_secret=${process.env.REACT_APP_GITHUB_CLIENT_SECRET}`;

    [err, issuesResponse] = await to(axios.get(`${issuesURL}`));
  } else {
    console.log("NO URL", finalDepData);
  }

  //console.log("ISSUES", issuesURL, issuesResponse.data);

  if (issuesResponse) {
    finalDepData.open_issues_count = issuesResponse.data.open_issues_count;
  }

  // get downloads
  let downloadsResponse;
  const downloadsURL = `https://api.npmjs.org/downloads/point/last-week/${dep}`;

  [err, downloadsResponse] = await to(axios.get(`${downloadsURL}`));

  if (downloadsResponse) {
    finalDepData.downloads = {};
    finalDepData.downloads.weekly = downloadsResponse.data;
  }

  console.log("FINAL DEP DATA", finalDepData);
}
