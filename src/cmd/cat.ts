import chalk from 'chalk'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import toLocalString, { Type } from 'util-extra/date/toLocalString'
import bug from '../bug'
import { Bug, BugState, Label } from '../provider'


export default async function handler(number: number): Promise<void> {
  const _bug = await bug.getBug(number)
  renderBug(_bug)
}

function renderBug(bug: Bug): void {
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

  if('' !== body.trim()) {
    renderBody(body)
    console.log('')
  }
}

function renderMeta(meta: { [key: string]: any }): void {
  const keys = Object.keys(meta)
  // const max: number = Math.max.apply(null, keys.map(str => str.length))
  
  console.log(`--------`)
  keys.forEach(key => {
    const val = meta[key]
    console.log(key + ': ' + chalk.gray(val))
  })
  console.log(`--------`)
}

function styleState(state: BugState): string {
  switch(state) {
    case BugState.Open: return chalk.bold.blue('OPEN')
    case BugState.Close: return chalk.bold.gray('CLOSE')
  }
}

function styleLabel({ color, name }: Label): string {
  return chalk.bold.bgHex(color)(` ${name} `)
}

function renderHeader(title: string, state: BugState): void {
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
