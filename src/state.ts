export const enum State { Open = 'open', Close = 'closed' }

export function parseState(state: string): State {
  switch(state) {
    case State.Open: return State.Open
    case State.Close: return State.Close
    default: throw new Error(`Unknown state "${state}"`)
  }
}
