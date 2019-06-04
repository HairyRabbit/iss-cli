import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { error } from "../tui"
import { parsePositionNumber, makeHelpOptions, HandlerOptions } from "../argv"
import { renderIssue } from "../render"

export default async function showIssue(args: string[], options: HandlerOptions): Promise<void> {
  const { name } = options
  const opts: Arguments = parseArgs(args, makeHelpOptions())
  if(opts.help) return printHelp(name)

  try {
    const number = parsePositionNumber(opts, 0, `<number>`).unwrap()
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
