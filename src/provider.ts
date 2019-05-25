import { State } from './state'

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

export interface IProvider {
  find(options?: FindOptions): Promise<Issue[]>
  get(number: number): Promise<Issue | null>
  // update(): Promise<Bug>
  // create(): Promise<Bug>
  // destroy(): Promise<void>
}
