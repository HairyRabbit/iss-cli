import Octokit, { IssuesListForRepoResponseItem, IssuesListForRepoParams, IssuesCreateParams, IssuesUpdateParams } from '@octokit/rest'
import { Provider, Issue as ProviderIssue, FindOptions, CreateOptions, parseState } from '../provider'
import config from '../config'

export default class Github implements Provider {
  public name: string = `github`
  private provider: Octokit

  constructor(private token: undefined | string, private user: string, private repo: string) {
    this.token = token
    this.user = user
    this.repo = repo
    this.provider = new Octokit({ auth: `token ${this.token}` })
  }

  async auth(username: string, password: string) {
    const newProvider: Octokit = new Octokit({ auth: {
      username,
      password,
      on2fa() { 
        return Promise.resolve('')
      }
    }})

    try {
      await newProvider.users.getAuthenticated()
      const res = await newProvider.oauthAuthorizations.createAuthorization({
        note: 'iss-cli',
        scopes: [`repo`]
      })
      const token = res.data.token
      config.writeProvider(this.name, { token, user: username })
      this.provider = new Octokit({ token })
      return true
    } catch(res) {
      console.error(res)
      return false
    }
  }

  async find(options: FindOptions) {
    const opts: IssuesListForRepoParams = buildIssueListOptions(this.user, this.repo, options)
    const issues = await this.provider.issues.listForRepo(opts)
    return issues.data.map(normalize)
  }

  async get(number: number) {
    try {
      const issue = await this.provider.issues.get({
        owner: this.user,
        repo: this.repo,
        issue_number: number
      })
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
    const opts: IssuesCreateParams = buildIssueCreateOptions(this.user, this.repo, options)
    const issue = await this.provider.issues.create(opts)
    return normalize(issue.data)
  }

  async update(number: number, options: any) {
    const opts: IssuesUpdateParams = buildIssueUpdateOptions(this.user, this.repo, number, options)
    const issue = await this.provider.issues.update(opts)
    return normalize(issue.data)
  }
  // destroy(): Promise<{}>
}

function buildIssueListOptions(user: string, repo: string, options: FindOptions): IssuesListForRepoParams {
  const opts: IssuesListForRepoParams = Object.create(null)
  opts.owner = user
  opts.repo = repo

  if(options.state) {
    opts.state = 'all' === options.state ? 'all' : parseState(options.state)
  } else if(options.labels) {
    opts.labels = transformLabels(options.labels)
  }

  return opts
}

function buildIssueCreateOptions(user: string, repo: string, options: CreateOptions): IssuesCreateParams {
  const opts: IssuesCreateParams = Object.create(null)
  opts.owner = user
  opts.repo = repo
  opts.title = options.title
  opts.labels = options.labels
  
  return opts
}

function buildIssueUpdateOptions(user: string, repo: string, number: number, options: any): IssuesUpdateParams {
  const opts: IssuesUpdateParams = Object.create(null)
  opts.owner = user
  opts.repo = repo
  opts.issue_number = number
  opts.title = options.title
  opts.labels = options.labels
  opts.state = options.state
  
  return opts
}

function transformLabels(labels: string[]) {
  return labels.join(',')
}

function normalize(issue: IssuesListForRepoResponseItem): ProviderIssue {
  const closeAt = issue.closed_at
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
    closeAt: null === closeAt ? null : new Date(closeAt)
  }
}
