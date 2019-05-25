export interface GithubLabel {
  id: number
  node_id: string
  url: string
  name: string
  color: string
  default: boolean
}

export interface GithubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: 'User'
  site_admin: boolean
}

export interface GithubIssue {
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  id: number
  node_id: string
  number: number
  title: string
  user: GithubUser
  labels: GithubLabel[]
  state: 'open' | 'closed'
  locked: boolean
  assignee: null | GithubUser
  assignees: GithubUser[]
  milestone: null
  comments: number
  created_at: string
  updated_at: string
  closed_at: null | string
  author_association: 'OWNER'
  body: null | string
  closed_by: null | GithubUser
}

export interface IssueFindOptions {
  milestone?: number | string
  state?: 'open' | 'closed' | 'all'
  assignee?: string
  creator?: string
  mentioned?: string
  labels?: string
  sort?: 'created' | 'updated' | 'comments'
  direction?: 'asc' | 'desc'
  since?: string
}

export interface IssueCreateOptions {
  title: string
  body?: string
  assignee?: string
  milestone?: number
  labels?: string[]
  assignees?: string[]
}

export interface IssueUpdateOptions {
  title?: string
  body?: string
  state?: 'open' | 'closed'
  assignee?: string
  milestone?: number
  labels?: string[]
  assignees?: string[]
}

export interface IssueLockOptions {
  lock_reason?: 'off-topic' | 'too heated' | 'resolved' | 'spam'
}

type Response<T> = {
  data: T
}

export class Issue {
  constructor(repository: string, auth?: any, apiBase?: string)
  listIssues(options?: IssueFindOptions, cb?: Function): Promise<Response<GithubIssue[]>>
  getIssue(issue: number): Promise<Response<GithubIssue>>
  createIssue(options: IssueCreateOptions, cb?: Function): Promise<Response<GithubIssue>>
  editIssue(issue: number, options: IssueUpdateOptions, cb?: Function): Promise<Response<GithubIssue>>
  // lockIssue(options): Promise<void>
  // unlockIssue(): Promise<void>
}

declare class GitHub {
  constructor(auth: any, ...args: any[]);
  getGist(id: any): any;
  getIssues(user: string, repo: string): Issue;
  getMarkdown(): any;
  getOrganization(organization: any): any;
  getProject(id: any): any;
  getRateLimit(): any;
  getRepo(user: any, repo: any): any;
  getTeam(teamId: any): any;
  getUser(user: any): any;
  search(query: any): any;
}

export default GitHub
