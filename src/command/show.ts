import parseArgs, { Arguments } from 'yargs-parser'
import { identity as id } from 'lodash'
import issueManager from '../issueManger'
import { parsePositionNumber, makeHelpOptions, HandlerOptions } from "../argv"
import { renderIssue, renderError } from "../render"

export default async function showIssue(args: string[], options: HandlerOptions): Promise<void> {
  const { name, postData = id } = options
  const opts: Arguments = parseArgs(args, makeHelpOptions({
    boolean: [`metas`],
    default: {
      metas: false
    }
  }))
  if(opts.help) return printHelp(name)

  try {
    const number = parsePositionNumber(opts, 0, `<number>`).unwrap()
    const issue = (await issueManager.getIssue(number)).unwrap()
    renderIssue(postData(issue), { 
      metas: opts.metas
    })
  } catch(e) {
    renderError(e)
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
