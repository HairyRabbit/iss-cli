import parseArgs, { Arguments } from 'yargs-parser'
import { identity as id } from 'lodash'
import issueManager from '../issueManger'
import { Issue, State, ListIssueOptions } from '../provider'
import { renderIssueList, renderError } from '../render'
import { makeHelpOptions, parsePositionString, HandlerOptions } from '../argv'

export default async function listIssue(args: string[], options: HandlerOptions): Promise<void> {
  const { name, preOptions = id } = options
  const opts: Arguments = parseArgs(args, makeHelpOptions({ 
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

  if(opts.help) return printHelp(name)

  try {
    const search = parsePositionString(opts, 0, `[...search]`).unwrapOr(undefined)

    const listIssueOptions: ListIssueOptions = preOptions({
      search,
      state: transformState(opts.closed, opts.all),
      labels: opts.label
    })
    const issues: Issue[] = await issueManager.listIssues(listIssueOptions)
  
    renderIssueList(issues, {
      verbose: opts.verbose
    })
  } catch(e) {
    renderError(e)
  }
}

function transformState(closed: boolean, all: boolean): State | 'all' {
  if(true === all) return `all`
  else if(true === closed) return State.Close
  else return State.Open
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} ls [...search] [...options]

Search:

title filter

Options:

--all, -a               - Show both open and closed issues
--closed, -c            - Only show closed issues
--help, -h              - Show helper

Examples:

${name} ls
${name} ls -a
${name} ls not work -a
`)
}
