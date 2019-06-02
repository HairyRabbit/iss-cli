import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { Issue, State } from '../provider'
import { renderIssueList } from '../render'
import { makeHelpOptions } from '../argv'
import { CLI_NAME } from './main'

export default async function listIssue(args: string[]): Promise<void> {
  const options: Arguments = parseArgs(args, makeHelpOptions({ 
    boolean: [`closed`, `all`, `verbose`],
    array: [{ key: 'label' }],
    default: {
      closed: false,
      all: false,
      verbose: false
    },
    alias: {
      closed: 'c',
      all: 'a'
    }
  }))

  if(options.help) return printHelp(CLI_NAME)

  const issues: Issue[] = await issueManager.listIssues({
    state: transformState(options.closed, options.all),
    labels: options.label
  })

  renderIssueList(issues, {
    verbose: options.verbose
  })
}

function transformState(closed: boolean, all: boolean): State | 'all' {
  if(true === all) return `all`
  else if(true === closed) return State.Close
  else return State.Open
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} ls [...options]

Options:

--all, -a               - Show both open and closed issues
--closed, -c            - Only show closed issues
--help, -h              - Show helper

License:

MIT Copyright © HairyRabbit
`)
}
