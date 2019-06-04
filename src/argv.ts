import { Arguments, Options } from "yargs-parser"
import { Result, Err, Ok } from "util-extra/container/result"
import unquote from "util-extra/string/unquote"

function makePositionArgumentRequiredError(name: string, position: number, type: string = `string`): Error {
  return new Error(`Positional argument #${position.toString()} ${type} ${name} was required`)
}

export function parsePositionNumber(options: Arguments, position: number = 0, name: string): Result<number, Error> {
  const number = options._[position]
  
  if(undefined === number) {
    return Err(makePositionArgumentRequiredError(name, position, `number`))
  }
  
  const ret = parseInt(number)
  
  if(isNaN(ret)) {
    return Err(new TypeError(`Invaild number "${ret}"`))
  }

  return Ok(ret)
}

export function parsePositionString(options: Arguments, startPosition: number = 0, name: string): Result<string, Error> {
  const value = options._.slice(startPosition)
  
  if(0 === value.length) {
    return Err(makePositionArgumentRequiredError(name, startPosition))
  }

  const ret = value.map(unquote).join(' ')
  return Ok(ret)
}


export function makeHelpOptions(options: Options = {}): Options {
  return {
    boolean: [`help`, ...(options.boolean || [])],
    alias: { 
      help: 'h',
      ...options.alias
    },
    default: {
      help: false,
      ...options.default
    }
  }
}

export interface HandlerOptions {
  name: string
  preOptions?<T>(options: T): T
  postOptions?<T>(options: T): T
  postData?<T>(data: T): T
}

export interface Command {
  command: string,
  description: string,
  isSubCommand: boolean
  options?: Omit<HandlerOptions, 'name'>
  handler(args: string[], options?: HandlerOptions): void | Promise<void>
}

export function makeCommand(
  command: string,
  description: string,
  isSubCommand: Command['isSubCommand'],
  handle: Command['handler'], 
  options: Command['options'] = {}
): Command {
  const cmd = Object.create(null)
  cmd.command = command
  cmd.description = description
  cmd.isSubCommand = isSubCommand
  cmd.handler = handle
  cmd.options = options
  return cmd
}
