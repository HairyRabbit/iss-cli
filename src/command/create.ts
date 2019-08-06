import parseArgs, { Arguments } from 'yargs-parser'
import { identity as id } from 'lodash'
import issueManager from '../issueManger'
import { renderIssue, renderError } from '../render'
import { parsePositionString, makeHelpOptions, HandlerOptions } from '../argv'
import { Issue, IssueOptions } from '../provider'
import { editor } from '../tui'
import { makeTitleRequiredError } from '../error'

interface CreateOptions extends HandlerOptions {
  template(title: string, labels?: string): string
}

export default async function createIssue(args: string[], options: CreateOptions): Promise<void> {
  const { name, preOptions = id } = options
  const opts = parseArgs(args, makeHelpOptions({
    boolean: [`edit`, `branch`],
    array: [{ key: 'label' }],
    alias: {
      edit: `e`,
      label: `l`,
      branch: `b`
    },
    default: {
      body: false,
      branch: false
    },
    configuration: {
      ['populate--']: true
    }
  }))

  if(opts.help) return printHelp(name)

  try {
    const title = parsePositionString(opts, 0, `<title>`).unwrapOr(null)
    let issueOptions: IssueOptions
    if(opts.edit) {
      issueOptions = await getOptionsFromEdit(title, opts, options)
    } else {
      if(null === title) throw makeTitleRequiredError(`feat add`)
      issueOptions = {
        title,
        labels: opts.label
      }
    }

    if(opts.branch) {
      issueOptions = {
        ...issueOptions,
        branch: id => `iss-#${id}`
      }
    }

    const issue: Issue = await issueManager.createIssue(preOptions(issueOptions))
    renderIssue(issue)
  } catch(e) {
    renderError(e)
    console.error(e)
  }
}

async function getOptionsFromEdit(title: string | null, args: Arguments, options: CreateOptions): Promise<IssueOptions> {
  const tpl: string = options!.template(title || '') || ''
  const content: string = await editor(tpl, args['--'])
  return parseContent(content)
}

function parseContent(content: string): IssueOptions {
  const headersRegExp: RegExp = /(-+)\n/g
  const beg: RegExpExecArray | null = headersRegExp.exec(content)
  const metas: [IssueOptions, number] | null = null === beg ? null : parseMetas(content, headersRegExp, beg)
  return null === metas ? {
    body: content.trim()
  } : {
    ...metas[0],
    body: content.slice(metas[1]).trim()
  }
}

function parseMetas(content: string, regexp: RegExp, begin: RegExpExecArray): [IssueOptions, number] {
  const end: RegExpExecArray | null = regexp.exec(content)
  if(null === end) throw new Error(`Bad metas`)
  const slice: number = end[0].length + end.index
  const options = content
    .slice(begin.index + begin[0].length, end.index)
    .split(/\r?\n/g)
    .filter(Boolean)
    .reduce((acc, curr) => {
      const [ key, value ] = curr.split(':').map(s => s.trim())
      
      if(`` === value) return acc
      else if(key === `labels`) acc[key] = value.split(`,`).filter(Boolean).map(s => s.trim())
      else acc[key] = value

      return acc
    }, Object.create(null))
  return [options, slice]
}

function printHelp(name: string): void {
  console.log(`
Usage: ${name} add  <title> [options]

Options:

--label, -l             - Add label
--edit, -e              - Use editor to write content
--branch, -b            - Checkout a new branch
--help, -h              - Show helper

Examples:

${name} add title
`)
}
