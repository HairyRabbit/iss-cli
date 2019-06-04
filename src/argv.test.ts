import parseArgs from 'yargs-parser'
import { parsePositionString } from './argv'
import { Ok, Result } from 'util-extra/container/result'

function parse(str: string): Result<string, Error> {
  return parsePositionString(parseArgs(str), 0, '')
}

describe(`parsePositionString()`, () => {
  test(`should parse string`, () => {
    expect(
      parse(`foo`)
    ).toEqual(
      Ok(`foo`)
    )
  })

  test(`should parse string with options`, () => {
    expect(
      parse(`foo --bar`)
    ).toEqual(
      Ok(`foo`)
    )
  })

  test(`should parse strings`, () => {
    expect(
      parse(`foo bar`)
    ).toEqual(
      Ok(`foo bar`)
    )
  })

  test(`should parse strings wrap qoute`, () => {
    expect(
      parse(`"foo bar"`)
    ).toEqual(
      Ok(`foo bar`)
    )
  })

  test(`should parse strings with options`, () => {
    expect(
      parse(`foo bar --baz`)
    ).toEqual(
      Ok(`foo bar`)
    )
  })
})
