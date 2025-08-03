import { DeploymentStatus } from "../../types.js";

export abstract class BaseAdapter {
  abstract name: string;

  abstract getLatestDeployment(
    project: string,
    token?: string
  ): Promise<DeploymentStatus>;

  abstract authenticate(token: string): Promise<boolean>;

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
