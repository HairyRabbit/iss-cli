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

export interface FindOptions {
  state?: State | 'all'
  labels?: string[]
}

export interface CreateOptions {
  title: string
  labels?: string[]
}

export interface UpdateOptions {

}

export interface Provider {
  login?(username: string, password: string): Promise<string>
  signout?(): Promise<void>
  find(options?: FindOptions): Promise<Issue[]>
  get(number: number): Promise<Issue | null>
  update(number: number, options: UpdateOptions): Promise<Issue>
  create(options: CreateOptions): Promise<Issue>
}

export interface ProviderConstructor {
  new(token: undefined | string, user: string, repo: string): Provider
}
