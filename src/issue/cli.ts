import chalk from 'chalk'
import parseArgs, { Arguments } from 'yargs-parser'
import toLocalString, { Type } from 'util-extra/date/toLocalString'
import { Optional, None, Some, isNone } from 'util-extra/container/optional'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import host from '../issue'
import { State } from '../state'
import { Issue, Label } from '../provider'
import { table, newline, metas, empty, markdown } from '../tui'

const enum Command {
  List = 'ls',
  Get = 'cat',
  Create = 'add',
  Open = 'open',
  Close = 'close',
  See = 'see',
  Rename = 'rename'
}

function dispatchCommand(command: string): Function {
  switch(command) {
    case Command.List: return listIssue
    case Command.Create: return createIssue
    case Command.Open: return openIssue
    case Command.Close: return closeIssue
    case Command.See: return seeIssue
    case Command.Rename: return renameIssue
    default: {
      const number: number = parseInt(command)
      if(!isNaN(number)) return getIssue
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

  const issues: Issue[] = await host.listIssues({
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


async function getIssue(number: number): Promise<void> {
  const issue: null | Issue = await host.getIssue(number)
  if(null === issue) return empty(`issue ${chalk.bold(number.toString())}`)
  renderIssue(issue)
}

function renderIssue(issue: Issue): void {
  const { title, state, body, url, createAt, updateAt, labels } = issue

  newline()

  renderHeader(title, state)
  newline()

  metas({
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

  function renderHeader(title: string, state: State): void {
    const stateStr: string = styleState(state)
    console.log(stateStr + ' ' + chalk.italic(title))
    
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

function createIssue() {}
function openIssue() {}
function closeIssue() {}

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
  const ret = await host.openBrowserIssue(number)

  if(isNone(ret)) {
    empty(`issue ${chalk.bold(number.toString())}`)  
    return
  } else {
    const [issue, openProc] = await ret.unwrap()
    console.log(`Open browser and visite "${issue.url}"`)
    openProc()
  }
}

function parseIssueNumber(options: Arguments, printHelper?: (() => void)): Optional<number> {
  const number = options._[1]
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

function renameIssue() {}

function printHelper() {
  
}

function makeUnknownCommandError(command: string): Error {
  return new Error(`Unknown command "${command}"`)
}

export default function main(args: string[]): void {
  const options = parseArgs(args)
  const cmds = options._
  if(0 === cmds.length) return printHelper()
  const command = dispatchCommand(cmds[0])
  command(args)
}

main(process.argv.slice(2))
