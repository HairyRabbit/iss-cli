import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { parsePositionNumber, makeHelpOptions, parsePositionString } from "../argv"
import { renderIssue, renderError } from "../render"
import { CLI_NAME } from './main'
import { Issue } from '../provider'

export default async function renameIssue(args: string[]): Promise<void> {
  const options: Arguments = parseArgs(args, makeHelpOptions())
  if(options.help) return printHelp(CLI_NAME)

  try {
    const number: number = parsePositionNumber(options).unwrap()
    const title: string = parsePositionString(options, 1).unwrap()
    const issue: Issue = (await issueManager.changeIssueTitle(number, title)).unwrap()
    renderIssue(issue)
  } catch(e) {
    renderError(e)
  }
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} rename <number> <title> [...options]

Options:

--help, -h              - Show helper

License:

MIT Copyright © HairyRabbit
`)
}
