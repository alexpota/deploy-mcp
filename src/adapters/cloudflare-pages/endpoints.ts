// Source: https://developers.cloudflare.com/api/resources/pages/

export const CloudflarePagesEndpoints = {
  // Base URL
  base: "https://api.cloudflare.com/client/v4",

  // Projects
  listProjects: (accountId: string) => `/accounts/${accountId}/pages/projects`,

  getProject: (accountId: string, projectName: string) =>
    `/accounts/${accountId}/pages/projects/${projectName}`,

  // Deployments
  listDeployments: (accountId: string, projectName: string) =>
    `/accounts/${accountId}/pages/projects/${projectName}/deployments`,

  getDeployment: (
    accountId: string,
    projectName: string,
    deploymentId: string
  ) =>
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}`,

  createDeployment: (accountId: string, projectName: string) =>
    `/accounts/${accountId}/pages/projects/${projectName}/deployments`,

  deleteDeployment: (
    accountId: string,
    projectName: string,
    deploymentId: string
  ) =>
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}`,

  retryDeployment: (
    accountId: string,
    projectName: string,
    deploymentId: string
  ) =>
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}/retry`,

  rollbackDeployment: (
    accountId: string,
    projectName: string,
    deploymentId: string
  ) =>
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}/rollback`,

  // Logs
  getDeploymentLogs: (
    accountId: string,
    projectName: string,
    deploymentId: string
  ) =>
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}/history/logs`,

  // Documentation URLs
  docs: {
    api: "https://developers.cloudflare.com/api/resources/pages/",
    gettingStarted: "https://developers.cloudflare.com/pages/get-started/",
    authentication:
      "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/",
    deployments:
      "https://developers.cloudflare.com/pages/configuration/deployments/",
    buildConfiguration:
      "https://developers.cloudflare.com/pages/configuration/build-configuration/",
  },
} as const;
