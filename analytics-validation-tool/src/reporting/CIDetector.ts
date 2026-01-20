/**
 * CI/CD Context Detector
 *
 * Detects CI/CD platform and extracts build context from environment variables.
 */

import type { CIContext } from './types';

/**
 * Detect CI/CD context from environment variables
 */
export function detectCIContext(): CIContext {
  const env = process.env;

  // GitHub Actions
  if (env.GITHUB_ACTIONS === 'true') {
    return {
      platform: 'github',
      buildId: env.GITHUB_RUN_ID,
      commitSha: env.GITHUB_SHA,
      branch: env.GITHUB_REF?.replace('refs/heads/', ''),
      prNumber: env.GITHUB_EVENT_NAME === 'pull_request' ? env.GITHUB_PR_NUMBER : undefined,
      buildUrl: env.GITHUB_SERVER_URL
        ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
        : undefined,
      isPullRequest: env.GITHUB_EVENT_NAME === 'pull_request',
    };
  }

  // GitLab CI
  if (env.GITLAB_CI === 'true') {
    return {
      platform: 'gitlab',
      buildId: env.CI_PIPELINE_ID,
      commitSha: env.CI_COMMIT_SHA,
      branch: env.CI_COMMIT_REF_NAME,
      prNumber: env.CI_MERGE_REQUEST_IID,
      buildUrl: env.CI_PIPELINE_URL,
      isPullRequest: env.CI_MERGE_REQUEST_IID !== undefined,
    };
  }

  // Jenkins
  if (env.JENKINS_HOME || env.JENKINS_URL) {
    return {
      platform: 'jenkins',
      buildId: env.BUILD_ID,
      commitSha: env.GIT_COMMIT,
      branch: env.GIT_BRANCH,
      buildUrl: env.BUILD_URL,
      isPullRequest: env.CHANGE_ID !== undefined,
      prNumber: env.CHANGE_ID,
    };
  }

  // CircleCI
  if (env.CIRCLECI === 'true') {
    return {
      platform: 'circle',
      buildId: env.CIRCLE_BUILD_NUM,
      commitSha: env.CIRCLE_SHA1,
      branch: env.CIRCLE_BRANCH,
      prNumber: env.CIRCLE_PULL_REQUEST
        ? env.CIRCLE_PULL_REQUEST.split('/').pop()
        : undefined,
      buildUrl: env.CIRCLE_BUILD_URL,
      isPullRequest: env.CIRCLE_PULL_REQUEST !== undefined,
    };
  }

  // Travis CI
  if (env.TRAVIS === 'true') {
    return {
      platform: 'travis',
      buildId: env.TRAVIS_BUILD_ID,
      commitSha: env.TRAVIS_COMMIT,
      branch: env.TRAVIS_BRANCH,
      prNumber: env.TRAVIS_PULL_REQUEST !== 'false' ? env.TRAVIS_PULL_REQUEST : undefined,
      buildUrl: env.TRAVIS_BUILD_WEB_URL,
      isPullRequest: env.TRAVIS_PULL_REQUEST !== 'false',
    };
  }

  // Unknown/local
  return {
    platform: 'unknown',
    isPullRequest: false,
  };
}

/**
 * Get exit code based on report status
 */
export function getExitCode(
  status: 'passed' | 'failed' | 'degraded' | 'error',
  failOnWarnings: boolean = false
): number {
  switch (status) {
    case 'passed':
      return 0;
    case 'degraded':
      return failOnWarnings ? 2 : 1;
    case 'failed':
    case 'error':
      return 2;
    default:
      return 2;
  }
}
