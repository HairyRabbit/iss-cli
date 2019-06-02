import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { error } from "../tui"
import { parsePositionNumber, makeHelpOptions } from "../argv"
import { renderIssue } from "../render"
import { CLI_NAME } from './main'

export default async function showIssue(args: string[]): Promise<void> {
  const options: Arguments = parseArgs(args, makeHelpOptions())

  if(options.help) return printHelp(CLI_NAME)

  try {
    const number = parsePositionNumber(options).unwrap()
    const issue = await issueManager.getIssue(number)
    renderIssue((await issue).unwrap())
  } catch(e) {
    error(e instanceof Error ? e.message : e)
  }
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} <number> [...options]

Options:

--help, -h              - Show helper

License:

MIT Copyright © HairyRabbit
`)
}
