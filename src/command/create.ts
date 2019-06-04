import parseArgs, { Arguments } from 'yargs-parser'
import { identity as id } from 'lodash'
import issueManager from '../issueManger'
import { renderIssue, renderError } from '../render'
import { parsePositionString, makeHelpOptions, HandlerOptions } from '../argv'
import { Issue } from '../provider'
import { editor } from '../tui'

export default async function createIssue(args: string[], options: HandlerOptions): Promise<void> {
  const { name, preOptions = id } = options
  const opts: Arguments = parseArgs(args, makeHelpOptions({
    boolean: [`body`],
    array: [{ key: 'label' }],
    alias: {
      body: `b`
    },
    default: {
      body: false
    }
  }))

  if(opts.help) return printHelp(name)

  try {
    const body: string | undefined = opts.body ? await editor() : undefined
    const title: string = parsePositionString(opts, 0, `<...title>`).unwrap()
    const issue: Issue = await issueManager.createIssue(preOptions({
      title, 
      body,
      labels: opts.lable 
    }))
    renderIssue(issue)
  } catch(e) {
    renderError(e)
  }
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} add  <...title> [...options]

Options:

--label                 - Add label
--help, -h              - Show helper

Examples:

${name} add title
`)
}
