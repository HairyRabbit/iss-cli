import { makeCommand, HandlerOptions } from '../argv'
import { IssueOptions, ListIssueOptions, Issue } from '../provider'
import { makeNotFeatureTitle } from '../error'
import listIssue from '../command/list'
import showIssue from '../command/show'
import createIssue from '../command/create'
import { openIssue, closeIssue } from '../command/toggle'
import browseIssue from '../command/browse'
import renameIssue from '../command/rename'
import loginIssue from '../command/login'
import makeCli from '../command/main'

export default makeCli(`feat`, {
  _: makeCommand(false, showIssue, {
    postData: assertFeatureTitle as HandlerOptions['postData']
  }),
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

const FEATURE_TITLE: string = `[Feature Request]`

function overrideListOptions(options: ListIssueOptions): ListIssueOptions {
  return {
    ...options,
    search: FEATURE_TITLE
  }
}

function assertFeatureTitle(issue: Issue): Issue {
  if(!issue.title.startsWith(FEATURE_TITLE)) throw makeNotFeatureTitle(issue.number)
  return issue
}

function overrideCreateOptions(options: IssueOptions): IssueOptions {
  return {
    ...options,
    title: `${FEATURE_TITLE} ${options.title}`,
    labels: [
      ...(options.labels || []),
      `feature`
    ]
  }
}

function overrideRenameOptions(title: string): string {
  return `[Feature Request] ${title}`
}
