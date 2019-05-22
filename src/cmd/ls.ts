import chalk from 'chalk'
import { Arguments, Argv } from 'yargs'
import toLocalString, { Type } from 'util-extra/date/toLocalString'
import bug from '../bug'
import { Bug, BugState } from '../provider'


export const command: string = 'ls'
export const desc: string = 'list bugs'

interface ListBugsOptions {
  verbose: boolean
  status: boolean
}

const DEFAULT_LISTBUGS_OPTIONS: ListBugsOptions = {
  verbose: false,
  status: false
}

export function builder(yargs: Argv<ListBugsOptions>): void {
  yargs
    .option(`verbose`, {
      type: `boolean`,
      description: `show url`,
      default: false
    })
    .option(`status`, {
      type: `boolean`,
      description: `show bugs status`,
      default: false
    })
}

export async function handler(args: Arguments<ListBugsOptions>): Promise<void> {
  const options: ListBugsOptions = {
    ...DEFAULT_LISTBUGS_OPTIONS,
    verbose: args.verbose,
    status: args.status
  }
  const bugs = await bug.listBugs()
  renderBugsList(bugs, process.stdout.columns || 80, options)
}

function renderBugsList(bugs: Bug[], maxLength: number, options: ListBugsOptions): void {
  const { status, verbose } = options
  

  const len = bugs.length
  const openedLen: number = bugs.filter(b => b.state === BugState.Open).length

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
      const method = bugState === BugState.Open ? chalk.blue : chalk.redBright
      
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
  
  console.log('')
  procs.forEach(proc => proc(state, max))
}
