import { makeCommand, HandlerOptions } from '../argv'
import { IssueOptions, ListIssueOptions, Issue } from '../provider'
import { makeNotFeatureTitle } from '../error'
import listIssue from '../command/list'
import showIssue from '../command/show'
import createIssue from '../command/create'
import { closeIssue } from '../command/toggle'
import browseIssue from '../command/browse'
import renameIssue from '../command/rename'
import loginIssue from '../command/login'
import makeCli from '../command/main'

export default makeCli(`feat`, {
  _: makeCommand(`feat <number>`, `Show issue detail`, false, showIssue, {
    postData: assertFeatureTitle as HandlerOptions['postData']
  }),
  ls: makeCommand(`feat ls`, `List feature request`, true, listIssue, {
    preOptions: overrideListOptions as HandlerOptions['preOptions']
  }),
  add: makeCommand(`feat add <title>`, `Create new feature request`, true, createIssue, {
    preOptions: overrideCreateOptions as HandlerOptions['preOptions']
  }),
  done: makeCommand(`feat doen <number>`, `Mark feature request works done`, true, closeIssue),
  see: makeCommand(`feat see <number>`, `Visit issue link by browser`, true, browseIssue),
  rename: makeCommand(`feat rename <number>`, `Update feature title`, true, renameIssue, {
    preOptions: overrideRenameOptions as HandlerOptions['preOptions']
  }),
  login: makeCommand(`feat login`, `Login and create access token`, true, loginIssue)
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
