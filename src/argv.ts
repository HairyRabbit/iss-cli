import { Arguments, Options } from "yargs-parser"
import { Result, Err, Ok } from "util-extra/container/result"

function makePositionArgumentRequiredError(position: number, type: string = `string`): Error {
  return new Error(`Positional argument #${position.toString()} ${type} was required`)
}

export function parsePositionNumber(options: Arguments, position: number = 0): Result<number, Error> {
  const number = options._[position]
  
  if(undefined === number) {
    return Err(makePositionArgumentRequiredError(position, `number`))
  }
  
  const ret = parseInt(number)
  
  if(isNaN(ret)) {
    return Err(new TypeError(`Invaild number "${ret}"`))
  }

  return Ok(ret)
}

export function parsePositionString(options: Arguments, position: number = 0): Result<string, Error> {
  const value = options._[position]
  
  if(undefined === value) {
    return Err(makePositionArgumentRequiredError(position))
  }

  return Ok(value)
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
