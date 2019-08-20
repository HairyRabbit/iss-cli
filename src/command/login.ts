import parseArgs, { Arguments } from 'yargs-parser'
import prompts from 'prompts'
import chalk from 'chalk'
import createIssueManager from '../issueManger'
import { makeHelpOptions, HandlerOptions } from "../argv"
import { renderError } from "../render"
import { margin } from '../tui'

export default async function loginIssue(args: string[], options: HandlerOptions): Promise<void> {
  const { name } = options
  const opts: Arguments = parseArgs(args, makeHelpOptions())
  if(opts.help) return printHelp(name)

  margin(`Login and create private access token:`)

  const question: prompts.PromptObject<"username" | "password">[] = [{
    type: 'text',
    name: 'username',
    message: `Username:`,
    validate(value: string) {
      return '' === value.trim() ? `Username was required` : true
    }
  }, {
    type: 'password',
    name: 'password',
    message: `Password:`,
    validate(value: string) {
      return '' === value.trim() ? `Password was required` : true
    }
  }]

  const { username, password } = await prompts(question, {
    onCancel() { process.exit(0) }
  })

  if(!username || !password) {
    renderError(new Error(`Username and Password was required`))
  }

  try {
    const issueManager = await createIssueManager()
    const token = (await issueManager.getToken(username, password)).unwrap()
    margin(`Created token ${chalk.blue.bold(token)} successful`)
  } catch(e) {
    renderError(e)
  }
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} login [...options]

Options:

--help, -h              - Show helper
`)
}
