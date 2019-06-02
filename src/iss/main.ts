import parseArgs, { Arguments } from 'yargs-parser'
import { renderError } from '../render'
import listIssue from './list'
import showIssue from './show'
import createIssue from './create'
import { openIssue, closeIssue } from './toggle'
import browseIssue from './browse'
import renameIssue from './rename'
import loginIssue from './login'

const enum Command {
  List = 'ls',
  Get = 'cat',
  Create = 'add',
  Open = 'open',
  Close = 'close',
  See = 'see',
  Rename = 'rename',
  Login = 'login'
}

interface CommandHandler {
  (args: string[]): Promise<void> | void
}

function dispatchCommand(command: string): [CommandHandler, boolean] {
  switch(command) {
    case Command.List: return [listIssue, true]
    case Command.Create: return [createIssue, true]
    case Command.Open: return [openIssue, true]
    case Command.Close: return [closeIssue, true]
    case Command.See: return [browseIssue, true]
    case Command.Rename: return [renameIssue, true]
    case Command.Login: return [loginIssue, true]

    default: {
      const number: number = parseInt(command)
      if(!isNaN(number)) return [showIssue, false]
      throw makeUnknownCommandError(command)
    }
  }
}

function makeUnknownCommandError(command: string): Error {
  return new Error(`Unknown command "${command}"`)
}

export const CLI_NAME: string = `iss`

export default function main(args: string[], pkg: { [key: string]: any }): void {
  const options: Arguments = parseArgs(args, {
    boolean: [ 'help', 'version' ],
    alias: { 
      help: 'h',
      version: 'v'
    },
    default: {
      help: false,
      version: false
    }
  })

  const cmds: string[] = options._
  if(options.version) return printVersion(pkg.version)
  else if(0 === cmds.length) return printHelper(CLI_NAME)

  try {
    const [command, isSubCommand] = dispatchCommand(cmds[0])
    if(isSubCommand) args.shift()
    command(args)
  } catch(e) {
    printHelper(CLI_NAME)
    renderError(e)
  }
}


function printHelper(name: string): void {
  console.log(`
Usage: 

${name} <number> [options]
${name} <command> [commandOptions]

Commands:

${name} <number>            - Show issue detail
${name} ls                  - List issues
${name} add <title>         - Create new issue
${name} rename <number>     - Update issue title
${name} close <number>      - Close issue
${name} open <number>       - Open issue
${name} see <number>        - Visit issue link by browser
${name} login               - Login and create access token

Options:

--help, -h              - Show helper
--version, -v           - Print CLI version

Providers:

local                   - Use local storage
github                  - Github API https://github.com
gitlab                  - Gitlab API https://gitlab.com

Environment Variables:

ISSCLI_TOKEN            - current provider access token
ISSCLI_{PROVIDER}_TOKEN - token for different provider, e.g ISSCLI_GITHUB_TOKEN
{PROVIDER}_TOKEN        - token for different provider, e.g GITHUB_TOKEN

License:

MIT Copyright © HairyRabbit
`)
}

function printVersion(version: string): void {
  console.log(`Version ${version}`)
}
