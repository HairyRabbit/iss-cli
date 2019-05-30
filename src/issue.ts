import chalk from 'chalk'
import parseArgs, { Arguments } from 'yargs-parser'
import toLocalString, { Type } from 'util-extra/date/toLocalString'
import { Optional, None, Some, isNone } from 'util-extra/container/optional'
import issueManager from './issueManger'
import { Issue, Label, State } from './provider'
import { table, newline, metas, empty, markdown } from './tui'

const enum Command {
  List = 'ls',
  Get = 'cat',
  Create = 'add',
  Open = 'open',
  Close = 'close',
  See = 'see',
  Rename = 'rename',
  Login = 'login',
  // Logout = 'logout'
}

function dispatchCommand(command: string): [(args: string[]) => Promise<void> | void, boolean] {
  switch(command) {
    case Command.List: return [listIssue, true]
    case Command.Create: return [createIssue, true]
    case Command.Open: return [openIssue, true]
    case Command.Close: return [closeIssue, true]
    case Command.See: return [seeIssue, true]
    case Command.Rename: return [renameIssue, true]
    case Command.Login: return [loginIssue, true]
    // case Command.Logout: return [logoutIssue, true]
    default: {
      const number: number = parseInt(command)
      if(!isNaN(number)) return [getIssue, false]
      throw makeUnknownCommandError(command)
    }
  }
}

async function listIssue(args: string[]) {
  const options: Arguments = parseArgs(args, { 
    boolean: [`closed`, `all`, `verbose`],
    array: [{ key: 'label' }],
    default: {
      closed: false,
      all: false,
      verbose: false
    },
    alias: {
      closed: 'c',
      all: 'a'
    }
  })

  const issues: Issue[] = await issueManager.listIssues({
    state: transformState(options.closed, options.all),
    labels: options.label
  })

  renderIssueList(issues, {
    verbose: options.verbose
  })
}

function transformState(closed: boolean, all: boolean): State | 'all' {
  if(true === all) return `all`
  else if(true === closed) return State.Close
  else return State.Open
}

interface RenderListOptions {
  verbose: boolean
}

function renderIssueList(issues: Issue[], options: RenderListOptions): void {
  const { verbose } = options
  verbose;

  table(issues, {
    number: {
      render(number, { state }) {
        const func = state === State.Open ? chalk.blue : chalk.red
        return func(number.toString())
      }
    },
    title: {
      width: 'auto'
    },
    updateAt: {
      render(date) {
        return chalk.gray(toLocalString(date, Type.Date))
      }
    }
  }, {
    empty: `issues`
  })
}


async function getIssue(args: string[]): Promise<void> {
  const options = parseArgs(args)
  const number = parseIssueNumber(options).unwrap()
  const issue: null | Issue = await issueManager.getIssue(number)
  if(null === issue) return empty(`issue ${chalk.bold(number.toString())}`)
  renderIssue(issue)
}

function renderIssue(issue: Issue): void {
  const { number, title, state, body, url, createAt, updateAt, labels } = issue

  newline()

  renderHeader(number, title, state)
  newline()

  metas({
    number: `#` + number.toString(),
    link: url,
    createAt: toLocalString(createAt, Type.DateTime),
    updateAt: toLocalString(updateAt, Type.DateTime)
  })
  newline()

  if(labels.length) {
    renderLabels(labels)
    newline()
  }

  '' === body.trim() 
    ? empty(`description`) 
    : markdown(body.trim())

  newline()

  function renderHeader(number: number, title: string, state: State): void {
    const stateStr: string = styleState(state)
    console.log([
      stateStr,
      `#${number.toString()}`,
      chalk.bold(title)
    ].join(' '))
    
    function styleState(state: State): string {
      switch(state) {
        case State.Open: return chalk.bold.blue(State.Open.toUpperCase())
        case State.Close: return chalk.bold.red(State.Close.toUpperCase())
        default: throw new Error(`Unknown state "${state}"`)
      }
    }
  }

  function renderLabels(labels: Label[]): void {
    console.log(labels.map(styleLabel).join(' '))

    function styleLabel({ color, name }: Label): string {
      return chalk.bold.bgHex(color)(` ${name} `)
    }
  }
}

async function createIssue(args: string[]): Promise<void> {
  const options: Arguments = parseArgs(args, {
    array: [{ key: 'label' }]
  })

  const title: string = parseIssueTitle(options).unwrap()
  const issue: Issue = await issueManager.createIssue({ title, labels: options.lable })
  
  renderIssue(issue)
}

function parseIssueTitle(options: Arguments, position: number = 0): Optional<string> {
  const title = options._[position]
  
  if(undefined === title) {
    printHelper!()
    return None
  }

  return Some(title)
}

async function seeIssue(args: string[]): Promise<void> {
  const options: Arguments = parseArgs(args, { 
    boolean: [`closed`, `all`, `verbose`],
    array: [{ key: 'label' }],
    default: {
      closed: false,
      all: false,
      verbose: false
    },
    alias: {
      closed: 'c',
      all: 'a'
    }
  })

  const number = parseIssueNumber(options).unwrap() 
  const ret = await issueManager.openBrowserIssue(number)

  if(isNone(ret)) {
    empty(`issue ${chalk.bold(number.toString())}`)  
    return
  } else {
    const [issue, openProc] = await ret.unwrap()
    console.log(`Open browser and visite "${issue.url}"`)
    openProc()
  }
}

function parseIssueNumber(options: Arguments, position: number = 0, printHelper?: (() => void)): Optional<number> {
  const number = options._[position]
  if(undefined === number) {
    printHelper!()
    return None
  }
  
  const ret = parseInt(number)
  
  if(isNaN(ret)) {
    printHelper!()
    return None
  }

  return Some(ret)
}

async function openIssue(args: string[]): Promise<void> {
  const options = parseArgs(args)

  const number = parseIssueNumber(options).unwrap()
  const issue = await issueManager.openIssue(number)
  console.log(`Issue #${number} opened, see ${issue.url}`)
}

async function closeIssue(args: string[]): Promise<void> {
  const options = parseArgs(args)

  const number = parseIssueNumber(options).unwrap()
  const issue = await issueManager.closeIssue(number)
  console.log(`Issue #${number} closed, see ${issue.url}`)
}

async function renameIssue(args: string[]): Promise<void> {
  const options = parseArgs(args)
  const number = parseIssueNumber(options).unwrap()
  const title = parseIssueTitle(options, 1).unwrap()
  const issue = await issueManager.changeIssueTitle(number, title)

  renderIssue(issue)
}

async function loginIssue(_args: string[]): Promise<void> {
  await issueManager.getToken()
  console.log(`Login successful`)
}

function printHelper() {
  console.log(`
Usage: iss <command|number> [...options]

Commands:

iss <number>            - Show issue by number
iss ls                  - List issues
iss add <title>         - Create new issue
iss rename <number>     - Update issue title
iss close <number>      - Close issue by number
iss open <number>       - Reopen issue by number
iss see <number>        - Visit issue link by browser
iss login               - Create access token

Options:

--help, -h              - Show helper
--version, -v           - Print CLI version

Providers:

github                  - https://github.com
gitlab                  - https://gitlab.com

Environment Variables:

ISSCLI_TOKEN            - provider access token
ISSCLI_{PROVIDER}_TOKEN - token for different provider
{PROVIDER}_TOKEN        - token for different provider

License:

MIT Copyright © HairyRabbit
`)
}

function printVersion() {
  console.log(`Version 1.0.0`)
}

function makeUnknownCommandError(command: string): Error {
  return new Error(`Unknown command "${command}"`)
}

export default function main(args: string[]): void {
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
  if(options.help) return printHelper()
  else if(options.version) return printVersion()
  else if(0 === cmds.length) return printHelper()
  
  const [command, isSubCommand] = dispatchCommand(cmds[0])
  if(isSubCommand) args.shift()
  command(args)
}

main(process.argv.slice(2))
