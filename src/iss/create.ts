import parseArgs, { Arguments } from 'yargs-parser'
import issueManager from '../issueManger'
import { renderIssue, renderError } from '../render'
import { parsePositionString, makeHelpOptions } from '../argv'
import { Issue } from '../provider'

export default async function createIssue(args: string[]): Promise<void> {
  const options: Arguments = parseArgs(args, makeHelpOptions({
    array: [{ key: 'label' }]
  }))

  try {
    const title: string = parsePositionString(options).unwrap()
    const issue: Issue = await issueManager.createIssue({ title, labels: options.lable })
    renderIssue(issue)
  } catch(e) {
    renderError(e)
  }
}
