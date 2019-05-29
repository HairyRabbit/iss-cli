import GitHubAPI, { GithubIssue, Issue, IssueCreateOptions, IssueFindOptions } from 'github-api'
import { Provider, Issue as ProviderIssue, FindOptions, CreateOptions } from '../provider'
import { parseState } from '../state'

export default class Github implements Provider {
  private provider: GitHubAPI
  private issues: Issue

  constructor() {
    this.provider = new GitHubAPI({
      username: 'HairyRabbit',
      password: '900416az'
    })
    // this.issues = this.provider.getIssues('HairyRabbit', 'Rest')
    this.issues = this.provider.getIssues('HairyRabbit', 'iss-cli')
  }

  async find(options: FindOptions) {
    const transformOptions = mapFindOptionsToIssueFindOptions(options)
    const issues = await this.issues.listIssues(transformOptions)
    return issues.data.map(normalize)
  }

  async get(number: number) {
    try {
      const issue = await this.issues.getIssue(number)
      return normalize(issue.data)
    } catch(e) {
      const status = e.response.status
      
      if(404 === status) {
        return null
      } else {
        throw new Error(e.response.statusText)
      }
    }
  }

  async create(options: CreateOptions) {
    const transformOptions = mapCreateOptionsToIssueCreateOptions(options)
    const issue = await this.issues.createIssue(transformOptions)
    return normalize(issue.data)
  }

  async update(number: number, options: any) {
    const issue = await this.issues.editIssue(number, options)
    return normalize(issue.data)
  }
  // destroy(): Promise<{}>
}

function mapFindOptionsToIssueFindOptions(options: FindOptions): IssueFindOptions {
  const issueFindOptions = Object.create(null)

  if(options.state) {
    issueFindOptions.state = 'all' === options.state ? 'all' : parseState(options.state)
  } else if(options.labels) {
    issueFindOptions.labels = transformLabels(options.labels)
  }

  return issueFindOptions
}

function mapCreateOptionsToIssueCreateOptions(options: CreateOptions): IssueCreateOptions {
  const issueCreateOptions = Object.create(null)
  issueCreateOptions.title = options.title

  if(options.labels) {
    issueCreateOptions.labels = transformLabels(options.labels)
  }

  return issueCreateOptions
}

function transformLabels(labels: string[]) {
  return labels.join(',')
}

// function parseLabels(labels: string): Label[]

function normalize(issue: GithubIssue): ProviderIssue {
  return {
    id: issue.id,
    number: issue.number,
    state: parseState(issue.state),
    url: issue.html_url,
    title: issue.title,
    body: null === issue.body ? '' : issue.body,
    labels: issue.labels,
    createAt: new Date(issue.created_at),
    updateAt: new Date(issue.updated_at),
    closeAt: null === issue.closed_at ? null : new Date(issue.closed_at)
  }
}
