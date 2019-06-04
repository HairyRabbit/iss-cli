import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { renderError } from '../render'
import { parsePositionNumber, makeHelpOptions } from '../argv'
import { margin } from '../tui'

export default async function browseIssue(args: string[]): Promise<void> {
  const options: Arguments = parseArgs(args, makeHelpOptions())

  try {
    const number = parsePositionNumber(options, 0, `<number>`).unwrap()
    const [ issue, proc ] = (await issueManager.openBrowserIssue(number)).unwrap()
    margin(`Open browser and visite "${issue.url}"`)
    proc()
  } catch(e) {
    renderError(e)
  }
}
