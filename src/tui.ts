import os from 'os'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { startCase, identity as id, padEnd, split, truncate } from 'lodash'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import stripAnsi from 'strip-ansi'
import chalk from 'chalk'
import randomString from 'util-extra/string/randomString'

// const commonOptions = {
//   writer: console.log
// }

export function newline(): void {
  console.log('')
}

export function margin(...msgs: [any?, ...any[]]): void {
  newline()
  console.log.apply(console, msgs)
  newline()
}

export function marginBottom(...msgs: [any?, ...any[]]): void {
  console.log.apply(console, msgs)
  newline()
}

export function error(...msgs: [any?, ...any[]]): void {
  return margin.apply(null, msgs.map(msg => chalk.red(msg)) as [any?, ...any[]])
}

export function metas(header: { [key: string]: string }, divLength: number = 8): void {
  hr(divLength)
  
  for (const key in header) {
    if (header.hasOwnProperty(key)) {
      const value = header[key]
      console.log(`${startKebabCase(key)}: ${chalk.gray(value)}`)
    }
  }

  hr(divLength)
}

function hr(length: number): void {
  console.log(`-`.repeat(length))
}

function startKebabCase(string: string): string {
  return startCase(string).replace(/\s+/g, '-')
}

export function empty(content: string): void {
  newline()
  console.log(chalk.italic.gray(`No ${content} found`))
  newline()
}

/// TABLE ///

interface Column<T, D> {
  order: number,
  width: 'auto' | boolean | number,
  render(val: T, data: D): string,
  // align: 'left' | 'center' | 'right'
  // color: string[]
}

const DEFAULT_COLUMN: Column<any, any> = {
  order: 0,
  width: true,
  // align: '',
  render: id
}

interface Options {
  max: number
  border: string
  index: boolean | ((index: number) => string)
  hr: boolean
  newline: boolean
  empty: string | (() => void)
}

const DEFAULT_OPTIONS: Options = {
  max: process.stdout.columns || 80,
  border: ' ',
  index: false,
  hr: false,
  newline: true,
  empty: `data`
}

type ConfigureColumns<T> = {
  [K in keyof T]: boolean | Partial<Column<T[K], T>>
}

type Columns<T> = {
  [K in keyof T]: Column<T[K], T>
}

export function table<T extends { [K in keyof T]: T[K] }>(
  data: T[], 
  columns?: Partial<ConfigureColumns<T>>,
  options?: Partial<Options>
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const { empty: emptyOption, max, border } = opts

  if(0 === data.length) {
    if(`string` === typeof emptyOption) empty(emptyOption)
    else emptyOption()
    return
  }

  const renderCols: Columns<T> = undefined === columns 
    ? getRenderColumns(data)
    : normalizeColumns(columns)

  function getRenderColumns(data: T[]): Columns<T> {
    const cols = Object.keys(data[0]).reduce<Partial<ConfigureColumns<T>>>((acc, col) => {
      acc[col as keyof T] = true
      return acc
    }, {})
    return normalizeColumns(cols)
  }

  function normalizeColumns(columns: Partial<ConfigureColumns<T>>): Columns<T> {
    const acc: Partial<Columns<T>> = {}

    for (const key in columns) {
      if (columns.hasOwnProperty(key)) {
        const value = columns[key]
        if(`boolean` === typeof value) {
          acc[key] = {
            ...DEFAULT_COLUMN
          }
        } else {
          acc[key] = {
            ...DEFAULT_COLUMN,
            ...value
          }
        }
      }
    }

    return acc as Columns<T>
  }

  const sortedColumns: string[] = sortColumns(renderCols)

  function sortColumns(columns: Columns<T>) {
    return Object.keys(columns).sort((acol, bcol) => {
      return columns[acol as keyof T].order - columns[bcol as keyof T].order
    })
  }

  type AccumulatorState = {
    [key: string]: {
      max: number,
      auto: boolean,
      pad: number
    }
  }

  interface AccumulatorProc {
    (pads: { [key: string]: number }): void
  }

  type Accumulator = [ AccumulatorProc[], AccumulatorState ]

  const [ procs, state ] = data.reduce<Accumulator>(([procs, state], ctx) => {
    const make: ((max: number) => string)[] = []
    
    sortedColumns.forEach(col => {
      const { render, width } = renderCols[col as keyof T]
      const val = ctx[col as keyof T]
      const content: string = render(val, ctx).replace(/\t/g, '  ')
      const strip: string = stripAnsi(content)
      const len: number = strip.length
      const contentLen: number = content.length
      const stripLengthTrimed: number = split(strip, '').length
      const contentLenTrimed: number = split(content, '').length
      make.push(pad => {
        const size: number = (contentLen - len) - (contentLen - contentLenTrimed) - (stripLengthTrimed - len) + pad
        if(len <=  size) return padEnd(content, size)
        return padEnd(truncate(content, { length: size }), size)
      })
      
      state[col] = state[col] || {}
      state[col].max = state[col].max || 0
      state[col].max = Math.max(state[col].max, len)
      if(`auto` === width) state[col].auto = true
    })


    procs.push((pads) => {
      const strs: string[] = []

      make.forEach((fn, index) => {
        const col: string = sortedColumns[index]
        const pad: number = pads[col]
        const ret: string = fn(pad)
        strs.push(ret)
      })

      console.log(strs.join(border))
    })

    return [procs, state]
  }, [[], {}])


  function computePads(state: AccumulatorState, max: number, border: string): { [key: string]: number } {
    const acc: { [key: string]: number } = {}
    const autos = []
    let maxLength = 0, columnsLength = 0

    for (const col in state) {
      if (state.hasOwnProperty(col)) {
        const { max, auto } = state[col]
        const len: number = max
        if(!auto) {
          maxLength += len
          acc[col] = len
        } else {
          autos.push(col)
        }
        columnsLength++
      }
    }

    const borderLength = border.length * (columnsLength - 1)
    const autoLength = max - maxLength - borderLength
    
    autos.forEach(col => {
      acc[col] = autoLength
    })

    return acc
  }

  const pads: { [key: string]: number } = computePads(state, max, border)
  procs.forEach(proc => proc(pads))
}

export function markdown(content: string): void {
  marked.setOptions({
    renderer: new TerminalRenderer({
      // width: process.stdout.columns || 60,
      width: 80,
      reflowText: true
    })
  })

  console.log(marked(content))
}

export function editor(template: string = ``, editor?: string): Promise<string> {
  const tempPath: string = path.join(os.tmpdir(), `iss-cli-tmp-${randomString()}.md`)
  fs.writeFileSync(tempPath, template, `utf-8`)
  const defaultEditor: string = /^win/.test(process.platform) ? 'notepad' : 'vim'
  const bin: string = editor
    || process.env.ISSCLI_EDITOR
    || process.env.VISUAL
    || process.env.EDITOR
    || defaultEditor

  return new Promise((res, rej) => {
    const ps = spawn(bin, [tempPath], { stdio: 'inherit' })
    ps.on(`exit`, (code: number) => {
      const content: string = fs.readFileSync(tempPath, `utf-8`)
      fs.unlinkSync(tempPath)
      switch(code) {
        case 0: return res(content)
        default: return rej()
      }
    })
  })
}
