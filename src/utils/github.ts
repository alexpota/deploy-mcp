/**
 * GitHub repository utilities
 */

export interface RepositoryInfo {
  exists: boolean;
  isPublic: boolean;
  name?: string;
  fullName?: string;
}

/**
 * Validates repository exists and gets its public/private status
 */
export async function validateRepository(
  user: string,
  repo: string
): Promise<RepositoryInfo> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${user}/${repo}`,
      {
        headers: {
          "User-Agent": "deploy-mcp/1.0",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!response.ok) {
      // Repository validation failed
      return { exists: false, isPublic: false };
    }

    const repoData = (await response.json()) as any;
    const isPublic = !repoData.private;
    // Repository validated successfully

    return {
      exists: true,
      isPublic,
      name: repoData.name,
      fullName: repoData.full_name,
    };
  } catch {
    // Repository validation error
    return { exists: false, isPublic: false };
  }
}

/**
 * Validates input parameters for user/repo/platform
 */
export function validateParams(
  user: string,
  repo: string,
  platform: string
): boolean {
  const validName = /^[a-zA-Z0-9._-]+$/;
  const validPlatforms = ["vercel", "netlify", "railway"];

  return (
    validName.test(user) &&
    validName.test(repo) &&
    validPlatforms.includes(platform)
  );
}
