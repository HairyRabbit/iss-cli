import parseArgs, { Arguments } from 'yargs-parser'
import { identity as id } from 'lodash'
import createIssueManager from '../issueManger'
import { parsePositionNumber, makeHelpOptions, parsePositionString, HandlerOptions } from "../argv"
import { renderIssue, renderError } from "../render"
import { Issue } from '../provider'

export default async function renameIssue(args: string[], options: HandlerOptions): Promise<void> {
  const { name, preOptions = id } = options
  const opts: Arguments = parseArgs(args, makeHelpOptions())
  if(opts.help) return printHelp(name)

  try {
    const number: number = parsePositionNumber(opts, 0, `<number>`).unwrap()
    const title: string = parsePositionString(opts, 1, `<...title>`).unwrap()
    const issueManager = await createIssueManager()
    const issue: Issue = (await issueManager.changeIssueTitle(number, preOptions(title))).unwrap()
    renderIssue(issue)
  } catch(e) {
    renderError(e)
  }
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} rename <number> <...title> [...options]

Options:

--help, -h              - Show helper

Examples:

${name} rename 2 rewrite title
`)
}
