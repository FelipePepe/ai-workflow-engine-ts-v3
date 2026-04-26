export class GitFlowService {
  createFeatureBranchName(runId: string, title: string): string {
    const safeTitle = title.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-").slice(0, 40);
    return `feature/ai-${runId}-${safeTitle}`;
  }

  buildCommitMessage(runId: string, title: string): string {
    return `[AI][${runId}] ${title}`;
  }

  policy(): Record<string, boolean> {
    return {
      mainDirectWrite: false,
      featureBranchRequired: true,
      pullRequestRequired: true,
      qualityGateRequired: true,
      securityGateRequired: true,
      humanApprovalForProduction: true
    };
  }
}
