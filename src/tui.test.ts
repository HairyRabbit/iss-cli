import stripAnsi from 'strip-ansi'
import toLocalString, { Type } from 'util-extra/date/toLocalString'
import { table } from './tui'

const log = console.log

let cache: string[] = []

function mockLog(...msgs: string[]) {
  msgs.forEach(msg => cache.push(msg))
}

function execCache() {
  const ret: string = cache.join('\n')
  resetCache()
  return ret
}

function resetCache() {
  cache = []
}

beforeAll(() => {
  global.console.log = jest.fn(mockLog)
})

afterAll(() => {
  global.console.log = log
})

describe(`table()`, () => {
  test(`empty`, () => {
    table([])

    expect(
      stripAnsi(execCache())
    ).toBe(`\

No data found
`)
  })

  test(`simple`, () => {
    table([
      { id: `1`, value: `foo` },
      { id: `2`, value: `bar` },
      { id: `3`, value: `baz` }
    ])
    expect(
      execCache()
    ).toBe(
      `\
1 foo
2 bar
3 baz\
`
    )
  })

  test(`equals width`, () => {
    table([
      { value: `fooooooo`, id: `1` },
      { value: `barrr`, id: `2` },
      { value: `baz`, id: `3` },
      { value: `quexxxxxxxxxxxx`, id: `4` }
    ])
    expect(
      execCache()
    ).toBe(
      `\
fooooooo        1
barrr           2
baz             3
quexxxxxxxxxxxx 4\
`
    )
  })

  test(`selected columns`, () => {
    table([
      { id: 1, value: `foo` },
      { id: 2, value: `bar` },
      { id: 3, value: `baz` }
    ], {
      value: true
    })
    expect(
      execCache()
    ).toBe(
      `\
foo
bar
baz\
`
    )
  })

  test(`custom render`, () => {
    table([
      { id: 1, value: `foo` },
      { id: 2, value: `bar` },
      { id: 3, value: `baz` }
    ], {
      id: {
        render(num) {
          return '#' + num
        }
      }
    })
    expect(
      execCache()
    ).toBe(
      `\
#1
#2
#3\
`
    )
  })

  test(`auto width`, () => {
    const now: Date = new Date
    const nowStr: string = toLocalString(now, Type.Date)
    table([
      { id: 1, value: `foo`, date: now},
      { id: 2, value: `bar`, date: now },
      { id: 3, value: `baz`, date: now }
    ], {
      id: {
        render(num) {
          return '#' + num
        }
      },
      value: {
        width: `auto`
      },
      date: {
        render(_date) {
          return nowStr
        }
      }
    }, {
      max: 80
    })

    const pad = 80 - (nowStr.length + '#1'.length + 2)

    expect(
      execCache()
    ).toBe(
      `\
#1 ${`foo`.padEnd(pad)} ${nowStr}
#2 ${`bar`.padEnd(pad)} ${nowStr}
#3 ${`baz`.padEnd(pad)} ${nowStr}\
`
    )
  })
})
