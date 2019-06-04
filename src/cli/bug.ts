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
  _: makeCommand(`bug <number>`, `Show bug detail`, false, showIssue),
  ls: makeCommand(`bug ls`, `List bugs`, true, listIssue, {
    preOptions: overrideListOptions as HandlerOptions['preOptions']
  }),
  add: makeCommand(`bug add <title>`, `Create new bug report`, true, createIssue, {
    preOptions: overrideCreateOptions as HandlerOptions['preOptions']
  }),
  open: makeCommand(`bug open <number>`, `Reopen bug`, true, openIssue),
  fix: makeCommand(`bug close <number>`, `Mark bug was fixed`, true, closeIssue),
  see: makeCommand(`bug see <number>`, `Visit issue link by browser`, true, browseIssue),
  rename: makeCommand(`bug rename <number>`, `Update bug report title`, true, renameIssue, {
    preOptions: overrideRenameOptions as HandlerOptions['preOptions']
  }),
  login: makeCommand(`bug login`, `Login and create access token`, true, loginIssue)
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
