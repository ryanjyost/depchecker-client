import licenses from "./licenses";

export const sortVersionsBehind = (a, b) => {
  a = a.major * 100 || a.minor * 10 || a.patch * 1 || 0;
  b = b.major * 100 || b.minor * 10 || b.patch * 1 || 0;

  if (a > b) return 1;
  if (b > a) return -1;

  return 0;
};

export const buildVersionsBehindText = versionsBehind => {
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

  return text.trim();
};

export const getLicenseDataForDep = dep => {
  let licenseData = null;
  let npmLicense = dep.license ? dep.license.toLowerCase() : null;

  // first see if has legit github info
  if (dep.github && dep.github.license && dep.github.license.key) {
    if (dep.github.license.key in licenses) {
      licenseData = licenses[dep.github.license.key];
    }
  }

  if (!licenseData) {
    // ok, let's try to see if some text matching finds something
    for (let key in licenses) {
      if (npmLicense === key) {
        licenseData = licenses[key];
        break;
      }

      let currLicenseBeingChecked = licenses[key];
      if (currLicenseBeingChecked.spdx_id.includes(npmLicense)) {
        licenseData = currLicenseBeingChecked;
        break;
      }

      if (currLicenseBeingChecked.name.includes(npmLicense)) {
        licenseData = currLicenseBeingChecked;
        break;
      }
    }
  }

  if (!licenseData) return npmLicense;

  return licenseData;
};

export const getLicenseLevel = licenseData => {
  if ("conditions" in licenseData) {
    if (licenseData.key === "mit") {
      return 0;
    } else if (licenseData.name.includes("GNU")) {
      return 3;
    } else {
      return 1;
    }
  } else {
    if (licenseData === "MIT") {
      return 0;
    }
  }

  return 4;
};

export const getHighestVulnerabilityScore = ossData => {
  let highestScore = -1;

  if (ossData.vulnerabilities.length === 0) {
    return -1;
  }

  for (let vul of ossData.vulnerabilities) {
    if (vul.cvssScore > highestScore) {
      highestScore = vul.cvssScore;
    }
  }

  return highestScore;
};

export default {
  sortVersionsBehind,
  buildVersionsBehindText,
  getLicenseDataForDep,
  getLicenseLevel
};
