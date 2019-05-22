import GitHubAPI from 'github-api'
import { Provider, Bug, BugState } from '../provider'


export default class Github implements Provider {
  private gh: GitHubAPI
  private issues: any
  constructor() {
    this.gh = new GitHubAPI({})
    this.issues = this.gh.getIssues('HairyRabbit', 'Rest')
  }

  async find() {
    const issues = await this.issues.listIssues()
    return issues.data.map(normalize)
  }

  async get(number: number) {
    const issue = await this.issues.getIssue(number)
    // console.log(issue.data)
    return normalize(issue.data)
  }

  // create(): Promise<{}>
  // update(): Promise<{}>
  // destroy(): Promise<{}>
}


function normalize(issue: any): Bug {
  return {
    id: issue.id,
    number: issue.number,
    state: mapGitHubIssueStateToBugState(issue.state),
    url: issue.url,
    title: issue.title,
    body: issue.body,
    labels: issue.labels,
    createAt: new Date(issue.created_at),
    updateAt: new Date(issue.updated_at),
    closeAt: null === issue.closed_at ? null : new Date(issue.closed_at)
  }
}

function makeUnknownStatError(state: string): Error {
  return new Error(`Unknown state "${state}"`)
}

function mapGitHubIssueStateToBugState(state: string): BugState {
  switch(state) {
    case 'open': return BugState.Open
    case 'closed': return BugState.Close
    default: throw makeUnknownStatError(state)
  }
}
