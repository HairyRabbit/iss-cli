import parseArgs from 'yargs-parser'
import createIssueManager from '../issueManger'
import { State } from '../provider'
import { makeHelpOptions, HandlerOptions, parsePositionNumbers } from '../argv'
import { renderError, renderNumbers, renderIssuesNumber } from '../render'
import { margin, error } from '../tui'

const TOGGLE_STATUS_OPTIONS: { [K in State]: { text: string } } = {
  [State.Open]: { text: `opened` },
  [State.Close]: { text: `closed` }
}

export function toggleIssue(state: State) {
  return async (args: string[], options: HandlerOptions): Promise<void> => {
    const { name } = options
    const { text } = TOGGLE_STATUS_OPTIONS[state]
    const opts = parseArgs(args, makeHelpOptions())
    if(opts.help) return printHelp(name, text)

    try {
      const issueManager = await createIssueManager()
      const numbers = parsePositionNumbers(opts, 0, `<number>`).unwrap()
      const [ issues, errors ] = (await issueManager.toggleIssue(numbers, state)).unwrap()
      
      if(errors.length > 0) {
        const errorNumbers = errors.map(({ number }) => number)
        error(`Oops, issue ${renderNumbers(errorNumbers)} can't ${text}`)
        // renderError()
      }

      if(issues.length > 0) {
        margin(`Issue ${renderIssuesNumber(issues)} ${text}`)
      }
    } catch(e) {
      renderError(e)
    }
  }
}

export const openIssue = toggleIssue(State.Open)
export const closeIssue = toggleIssue(State.Close)

function printHelp(name: string, command: string): void {
  console.log(`
Usage: ${name} ${command} <number...> [options]

Positional:

numbers:                - Numbers, at least one

Options:

--help, -h              - Show helper

Examples:

${name} ${command} 42
${name} ${command} 41 42
${name} ${command} 41,42,43
`)
}
