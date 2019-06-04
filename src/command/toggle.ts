import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { Issue, State } from '../provider'
import { parsePositionNumber, makeHelpOptions, HandlerOptions } from '../argv'
import { renderError } from '../render'
import { margin } from '../tui'

const TOGGLE_STATUS_OPTIONS: { [K in State]: { text: string } } = {
  [State.Open]: { text: `opened` },
  [State.Close]: { text: `closed` }
}

export function toggleIssue(state: State) {
  return async (args: string[], options: HandlerOptions): Promise<void> => {
    const { name } = options
    const { text } = TOGGLE_STATUS_OPTIONS[state]
    const opts: Arguments = parseArgs(args, makeHelpOptions())
    if(opts.help) return printHelp(name, text)

    try {
      const number: number = parsePositionNumber(opts, 0, `<number>`).unwrap()
      const issue: Issue = (await issueManager.toggleIssue(number, state)).unwrap()
      margin(`Issue #${number} ${text}, see ${issue.url}`)
    } catch(e) {
      renderError(e)
    }
  }
}

export const openIssue = toggleIssue(State.Open)
export const closeIssue = toggleIssue(State.Close)

function printHelp(name: string, command: string): void {
  console.log(`
Usage: ${name} ${command} [...options]

Options:

--help, -h              - Show helper

Examples:

${name} ${command}
`)
}
