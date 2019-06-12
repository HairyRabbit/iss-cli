import Octokit, { IssuesListForRepoResponseItem, IssuesListForRepoParams, IssuesCreateParams, IssuesUpdateParams, HookError, SearchIssuesParams } from '@octokit/rest'
import { Provider, Issue as ProviderIssue, IssueOptions, parseState, ListIssueOptions } from '../provider'
import config from '../config'
import { makeAuthenticationError } from '../error'
import { identity as id } from 'lodash'

export default class Github implements Provider {
  public static providerName: string = `GitHub`
  private provider: Octokit

  constructor(private token: undefined | string, private user: string, private repo: string) {
    this.token = token
    this.user = user
    this.repo = repo
    this.provider = new Octokit({ auth: `token ${this.token}` })
  }

  async login(username: string, password: string): Promise<string> {
    
    const newProvider: Octokit = new Octokit({ auth: {
      username,
      password,
      on2fa() { return Promise.resolve('') }
    }})

    try {
      const auths = await newProvider.oauthAuthorizations.listAuthorizations()
      const id: undefined | number = auths.data.find(auth => `iss-cli` === auth.note)!.id
      if(undefined !== id) await newProvider.oauthAuthorizations.deleteAuthorization({ authorization_id: id })

      const res = await newProvider.oauthAuthorizations.createAuthorization({
        note: `iss-cli`,
        note_url: `https://github.com/HairyRabbit/iss-cli`,
        scopes: [`repo`]
      })

      const token: string = res.data.token
      this.setupToken(token)
      return token
    } catch(res) {
      const status: undefined | number = res.status
      if(undefined !== status) {
        if(401 === status)  {
          throw new Error(`Bad credentials, invalid username or password`)
        }
      }

      const errs: undefined | HookError['errors'] = res.errors
      if(undefined !== errs) {
        const msgs = errs.map(({ code }) => code)
        throw new Error(msgs.join(`\n`))
      }

      throw new Error(res)
    }
  }

  private setupToken(token: string) {
    config.writeProviderToken(Github.providerName, token)
    this.provider = new Octokit({ token })
  }

  async find(options: ListIssueOptions) {
    if(!options.search) {
      const opts: IssuesListForRepoParams = buildIssueListOptions(this.user, this.repo, options)
      try {
        const issues = await this.provider.issues.listForRepo(opts)
        return issues.data.map(normalize)
      } catch(e) {
        throw transformError(e)
      }
    } else {
      const opts: SearchIssuesParams = buildIssueSearchOptions(this.user, this.repo, options)
      try {
        const issues = await this.provider.search.issuesAndPullRequests(opts)
        return issues.data.items.map(normalize)
      } catch(e) {
        throw transformError(e)
      }
    }
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
      throw transformError(e)
    }
  }

  async create(options: IssueOptions) {
    const opts: IssuesCreateParams = buildIssueCreateOptions(this.user, this.repo, options)

    try {
      const issue = await this.provider.issues.create(opts)
      return normalize(issue.data)
    } catch(e) {
      throw transformError(e)
    }
  }

  async update(number: number, options: any) {
    const opts: IssuesUpdateParams = buildIssueUpdateOptions(this.user, this.repo, number, options)
    
    try {
      const issue = await this.provider.issues.update(opts)
      return normalize(issue.data)
    } catch(e) {
      throw transformError(e)
    }
  }
}

function buildIssueListOptions(user: string, repo: string, options: ListIssueOptions): IssuesListForRepoParams {
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

function buildIssueSearchOptions(user: string, repo: string, options: ListIssueOptions): SearchIssuesParams {
  const query: string[] = []

  query.push(`is:issue`)  
  query.push(`repo:${user}/${repo}`)
  
  if(options.state && `all` !== options.state) {
    query.push(`state:${parseState(options.state)}`)
  } 
  
  if(options.labels) {
    options.labels.forEach(label => {
      query.push(`label:${label}`)
    })
  }

  query.push(`${options.search} in:title`)

  return {
    q: query.join(' ')
  }
}

function buildIssueCreateOptions(user: string, repo: string, options: IssueOptions): IssuesCreateParams {
  const opts: IssuesCreateParams = Object.create(null)
  opts.owner = user
  opts.repo = repo
  opts.title = options.title || ''
  
  if(options.labels) opts.labels = options.labels
  if(options.body) opts.body = options.body
  
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

function transformLabels(labels: string[]): string {
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

type RequestError = Error & Omit<Octokit.Response<never>, 'data'>

type TransformErrorOptions = {
  token: string,
  tokenFrom: string
} & {
  number: number
}

function transformError({ token, tokenFrom, number }: TransformErrorOptions, custom: (err: RequestError) => Error = id) {
  return (err: RequestError): Error => {
    switch(err.status) {
      case 500:
        if(!err.message.match(/ETIMEDOUT/)) return err
        return new Error(`Connect timeout`)
      case 401:
        return makeAuthenticationError(token, tokenFrom)
      case 404:
        return new Error(`Issue #${number.toString()} was not found`)
      default: return custom(err)
    }
  }
}
