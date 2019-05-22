export const enum BugState { Open, Close }

export type Label = {
  color: string,
  name: string
}

export interface Bug {
  id: number
  number: number
  title: string
  body: string
  state: BugState
  url: string
  labels: { color: string, name: string }[]
  createAt: Date
  updateAt: Date
  closeAt: null | Date
}

export interface Provider {
  find(): Promise<Bug[]>
  get(number: number): Promise<Bug>
  // update(): Promise<Bug>
  // create(): Promise<Bug>
  // destroy(): Promise<void>
}
