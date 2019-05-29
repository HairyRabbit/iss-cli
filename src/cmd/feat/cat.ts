import chalk from 'chalk'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import toLocalString, { Type } from 'util-extra/date/toLocalString'
import { startCase } from 'lodash'
import iss from '../../issue'
import { Issue, Label } from '../../provider'
import { State } from '../../state'
import { newline } from '../../tui'


export default async function handler(number: number): Promise<void> {
  const issue = await iss.getIssue(number)
  if(null === issue) return renderEmpty(number)
  renderIssue(issue)
}

function renderIssue(bug: Issue): void {
  const { title, state, body, url, createAt, updateAt, labels } = bug

  console.log('')

  renderHeader(title, state)
  console.log('')

  if(labels.length) {
    renderLabels(labels)
    console.log('')
  }
  
  renderMeta({
    link: url,
    createAt: toLocalString(createAt, Type.DateTime),
    updateAt: toLocalString(updateAt, Type.DateTime)
  })
  console.log('')

  '' === body.trim() ? console.log(chalk.italic.gray(`No description`)) : renderBody(body.trim())
  console.log('')
}

function renderMeta(meta: { [key: string]: any }): void {
  const keys = Object.keys(meta)
  
  console.log(`--------`)
  keys.forEach(key => {
    const val = meta[key]
    console.log(startCase(key) + ': ' + chalk.gray(val))
  })
  console.log(`--------`)
}

function styleState(state: State): string {
  switch(state) {
    case State.Open: return chalk.bold.blue(State.Open)
    case State.Close: return chalk.bold.gray(State.Close)
    default: throw new Error(`Unknown state "${state}"`)
  }
}

function styleLabel({ color, name }: Label): string {
  return chalk.bold.bgHex(color)(` ${name} `)
}

function renderHeader(title: string, state: State): void {
  const stateStr: string = styleState(state)
  console.log(stateStr + ' ' + chalk.italic(title))
}

function renderLabels(labels: Label[]): void {
  console.log(labels.map(styleLabel).join(' '))
}

function renderBody(body: string): void {
  marked.setOptions({
    renderer: new TerminalRenderer()
  })

  console.log(marked(body))
}

function renderEmpty(id: number): void {
  newline()
  console.log(`Not found issue ${chalk.bold.red(`#${id.toString()}`)}`)
  console.log(`Try type "iss ls" to list open issues`)
  newline()
}
