import { makeCommand, HandlerOptions } from '../argv'
import { IssueOptions, ListIssueOptions } from '../provider'
import listIssue from '../command/list'
import showIssue from '../command/show'
import createIssue from '../command/create'
import { openIssue, closeIssue } from '../command/toggle'
import browseIssue from '../command/browse'
import renameIssue from '../command/rename'
import loginIssue from '../command/login'
import makeCli from '../command/main'


export default makeCli(`bug`, {
  _: makeCommand(false, showIssue),
  ls: makeCommand(true, listIssue, {
    preOptions: overrideListOptions as HandlerOptions['preOptions']
  }),
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


function overrideListOptions(options: ListIssueOptions): ListIssueOptions {
  return {
    ...options,
    search: `[Bug Report]`
  }
}

function overrideCreateOptions(options: IssueOptions): IssueOptions {
  return {
    ...options,
    title: `[Bug Report] ${options.title}`,
    labels: [
      ...(options.labels || []),
      `bug`
    ]
  }
}

function overrideRenameOptions(title: string): string {
  return `[Bug Report] ${title}`
}
