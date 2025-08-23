import { DeploymentStatus } from "../../types.js";

export abstract class BaseAdapter {
  abstract name: string;

  abstract getLatestDeployment(
    project: string,
    token?: string
  ): Promise<DeploymentStatus>;

  abstract authenticate(token: string): Promise<boolean>;

  abstract getDeploymentById(deploymentId: string, token: string): Promise<any>;

  abstract getRecentDeployments(
    project: string,
    token: string,
    limit?: number
  ): Promise<any[]>;

  abstract getDeploymentLogs(
    deploymentId: string,
    token: string
  ): Promise<string>;

  abstract listProjects(
    token: string,
    limit?: number
  ): Promise<Array<{ id: string; name: string; url?: string }>>;

  protected formatTimestamp(date: Date | string | number): string {
    return new Date(date).toISOString();
  }

  protected calculateDuration(
    start: Date | string | number,
    end?: Date | string | number
  ): number {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    return Math.floor((endTime - startTime) / 1000);
  }
}
