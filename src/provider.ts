import { Token } from "./token"

export const enum State { Open = 'open', Close = 'closed' }

export function parseState(state: string): State {
  switch(state) {
    case State.Open: return State.Open
    case State.Close: return State.Close
    default: throw new Error(`Unknown state "${state}"`)
  }
}

export type Label = {
  color: string,
  name: string
}

export interface Issue {
  id: number
  number: number
  title: string
  body: string
  state: State
  url: string
  labels: { color: string, name: string }[]
  createAt: Date
  updateAt: Date
  closeAt: null | Date
}

export interface ListIssueOptions {
  state?: State | 'all'
  search?: string
  labels?: string[]
}

export interface IssueOptions {
  title?: string
  body?: string
  labels?: string[]
  state?: string
  branch?(id: number): string
}

export interface OptionsOverrider<T> {
  (options: T): T
}

export interface Provider {
  login?(username: string, password: string): Promise<string>
  signout?(): Promise<void>
  find(options?: ListIssueOptions): Promise<Issue[]>
  get(number: number): Promise<Issue | null>
  update(number: number, options: IssueOptions): Promise<Issue>
  create(options: IssueOptions): Promise<Issue>
}

export interface ProviderConstructor {
  new(token: Token, user: string, repo: string): Provider
}
