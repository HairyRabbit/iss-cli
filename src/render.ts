import chalk from "chalk"
import toLocalString, { Type } from "util-extra/date/toLocalString"
import { newline, metas, empty, markdown, table, error, margin, marginBottom } from "./tui"
import { Issue, State, Label } from "./provider"

interface RenderIssueOptions {
  metas?: boolean
}

export function renderIssue(issue: Issue, options: RenderIssueOptions = {}): void {
  const { metas: metasOptions } = options
  const { number, title, state, body, url, createAt, updateAt, labels } = issue

  renderHeader(number, title, state)

  if(true === metasOptions) {
    metas({
      number: `#` + number.toString(),
      link: url,
      createAt: toLocalString(createAt, Type.DateTime),
      updateAt: toLocalString(updateAt, Type.DateTime)
    })
    newline()
  }

  if(labels.length) {
    renderLabels(labels)
  }

  if('' === body.trim()) {
    empty(`description`)
  } else {
    markdown(body.trim())
  }
  newline()

  function renderHeader(number: number, title: string, state: State): void {
    const stateStr: string = styleState(state)
    margin([
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
    marginBottom(labels.map(styleLabel).join(' '))

    function styleLabel({ color, name }: Label): string {
      return chalk.bold.bgHex(color)(` ${name} `)
    }
  }
}

export function renderIssueList(issues: Issue[], _options: any): void {
  // const { verbose } = options
  // verbose;

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

export function renderError(e: unknown): void {
  console.log(e)
  error(e instanceof Error ? e.message : e)
}

type AuthorObject = {
  name?: string,
  email?: string,
  url?: string
}

export function renderLicenseAndCopyright(author: string | AuthorObject, license: string = `MIT`): string {
  const authorString: string = `string` === typeof author 
    ? author 
    : [author.name, author.email, author.url].join(' ')
  
  const copyright: string = authorString === '' ? '' : `Copyright © ${authorString}`
  
  return `\
License:

${license.toUpperCase()} ${copyright}`
}

export function renderFooter(): string {
return `\
Thanks for use. Any ${chalk.bold(`bug`)} or ${chalk.bold(`feature request`)} please report on:

https://github.com/HairyRabbit/iss-cli/issues/new/choose

❤`
}

// export function renderHelper(content: string, author) {
//   console.log(content + '\n\n' + renderLicenseAndCopyright())
// }


export function renderCommands(commands: [string, string][]) {
  return commands.map(([ command, description ]) => {
    return command.padEnd(24) + `- ` + description
  }).join('\n')
}

function renderNumber(number: number): string {
  return '#' + number.toString()
}

export function renderNumbers(numbers: number[]): string {
  return numbers.map(number => renderNumber(number)).join(',')
}

export function renderIssuesNumber(issues: Issue[]) {
  return renderNumbers(issues.map(({ number }) => number))
}
