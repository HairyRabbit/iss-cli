import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { Issue, State } from '../provider'
import { parsePositionNumber, makeHelpOptions } from '../argv'
import { renderError } from '../render'
import { margin } from '../tui'

const TOGGLE_STATUS_OPTIONS: { [K in State]: { text: string } } = {
  [State.Open]: { text: `opened` },
  [State.Close]: { text: `closed` }
}

export function toggleIssue(state: State) {
  return async (args: string[]): Promise<void> => {
    const { text } = TOGGLE_STATUS_OPTIONS[state]
    const options: Arguments = parseArgs(args, makeHelpOptions())
    
    try {
      const number: number = parsePositionNumber(options).unwrap()
      const issue: Issue = (await issueManager.toggleIssue(number, state)).unwrap()
      margin(`Issue #${number} ${text}, see ${issue.url}`)
    } catch(e) {
      renderError(e)
    }
  }
}

export const openIssue = toggleIssue(State.Open)
export const closeIssue = toggleIssue(State.Close)
