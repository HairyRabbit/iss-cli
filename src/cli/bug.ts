import { makeCommand, HandlerOptions } from '../argv'
import { IssueOptions } from '../provider'
import listIssue from '../command/list'
import showIssue from '../command/show'
import createIssue from '../command/create'
import { openIssue, closeIssue } from '../command/toggle'
import browseIssue from '../command/browse'
import renameIssue from '../command/rename'
import loginIssue from '../command/login'
import makeCli from '../command/main'


export default makeCli(`bug`, {
  ls: makeCommand(true, listIssue),
  cat: makeCommand(false, showIssue),
  add: makeCommand(true, createIssue, {
    preOptions: overrideCreateOptions as HandlerOptions['preOptions']
  }),
  open: makeCommand(true, openIssue),
  done: makeCommand(true, closeIssue),
  see: makeCommand(true, browseIssue),
  rename: makeCommand(true, renameIssue, {
    preOptions: overrideRenameOptions as HandlerOptions['preOptions']
  }),
  login: makeCommand(true, loginIssue)
})

function overrideCreateOptions(options: IssueOptions): IssueOptions {
  return {
    ...options,
    title: `[Bug] ${options.title}`,
    labels: [
      ...(options.labels || []),
      `bug`
    ]
  }
}

function overrideRenameOptions(title: string): string {
  return `[Bug] ${title}`
}
