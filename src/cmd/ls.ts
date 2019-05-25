import chalk from 'chalk'
import { Arguments, Argv } from 'yargs'
import toLocalString, { Type } from 'util-extra/date/toLocalString'
import iss from '../issue'
import { Issue, FindOptions } from '../provider'
import { State } from '../state'
import { newline } from '../tui'

export const command: string = 'ls'
export const desc: string = 'List issues'

interface ListIssueOptions {
  url: boolean
  status: boolean
  open: boolean
  closed: boolean
  all: boolean
}

const DEFAULT_LISTBUGS_OPTIONS: ListIssueOptions = {
  url: false,
  status: false,
  open: true,
  closed: false,
  all: false
}

export function builder(yargs: Argv<ListIssueOptions>): void {
  yargs
    .option(`verbose`, {
      type: `boolean`,
      description: `Show link for each issue`,
      default: false
    })
    .option(`status`, {
      type: `boolean`,
      description: `Show issues summary over list`,
      default: false
    })
    .option(`open`, {
      type: `boolean`,
      description: `Only show open state issues`,
      default: true
    })
    .option(`closed`, {
      type: `boolean`,
      alias: 'c',
      description: `Only show closed state issues`,
      default: false
    })
    .option(`all`, {
      type: `boolean`,
      alias: 'a',
      description: `Show all state issues`,
      default: false
    })
}

export async function handler(args: Arguments<ListIssueOptions>): Promise<void> {
  const options: ListIssueOptions = {
    ...DEFAULT_LISTBUGS_OPTIONS,
    url: args.url,
    status: args.status,
    open: args.open,
    closed: args.closed,
    all: args.all
  }
  const bugs = await iss.listIssues(mapListIssueOptionsToFindOptions(options))
  renderList(bugs, process.stdout.columns || 80, options)
}

function mapListIssueOptionsToFindOptions(options: ListIssueOptions): FindOptions {
  return {
    state: transformListIssueStateOptions(options)
  }
}

function transformListIssueStateOptions(options: ListIssueOptions): FindOptions['state'] {
  if(options.all) return 'all'
  else if(options.closed) return State.Close
  else return State.Open
}

function renderList(bugs: Issue[], maxLength: number, options: ListIssueOptions): void {
  const { status, url: verbose } = options
  

  const len = bugs.length
  const openedLen: number = bugs.filter(b => b.state === State.Open).length

  if(status) {
    console.log(`
------
Bugs count: ${len}
Opened: ${chalk.blue(openedLen.toString())}
Closed: ${chalk.gray((len - openedLen).toString())}
------
  `)

    return
  }

  if(0 === len) {
    console.log(`No bugs found`)
  }

  type AccumulatorState = {
    maxNumberLength: number,
    maxTitleLength: number
  }

  interface AccumulatorProc {
    (state: AccumulatorState, max: number): void
  }

  type Accumulator = [ AccumulatorProc[], AccumulatorState ]

  const [ procs, state ] = bugs.reduce<Accumulator>((acc, bug) => {
    const { number, state: bugState, title, createAt }  = bug
    const { maxNumberLength, maxTitleLength } = acc[1]
    
    acc[1] = {
      maxNumberLength: Math.max(maxNumberLength, number.toString().length),
      maxTitleLength: Math.max(maxTitleLength, title.length)
    }

    acc[0].push((state, max) => {
      const numberStr = '#' + number.toString().padEnd(state.maxNumberLength)
      const titleStr = title.length + 3 >= max ? title.substring(0, max - 3) + '...' : title.padEnd(max)
      const createStr = toLocalString(createAt, Type.Date)
      const method = bugState === State.Open ? chalk.blue : chalk.gray
      
      console.log([
        method(numberStr), 
        titleStr,
        chalk.gray(createStr)
      ].join(' '))

      const whitespace = ' '.repeat(numberStr.length + 1)
      
      if(verbose) {
        console.log(whitespace + chalk.magenta('Link: ') + bug.url)
        console.log(
          '----------'
        )
      }
    })

    return acc
  }, [ [], { maxNumberLength: 0, maxTitleLength: 0 } ])

  const constLen: number = (state.maxNumberLength + 10 + 3)
  const max: number = maxLength - constLen
  
  newline()
  procs.forEach(proc => proc(state, max))
}
