import { makeCommand, HandlerOptions } from '../argv'
import { IssueOptions, ListIssueOptions, Issue } from '../provider'
import { makeNotFeatureTitle, makeTitleRequiredError } from '../error'
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
    preOptions: overrideCreateOptions as HandlerOptions['preOptions'],
    template: makeCreateTemplate
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
  if(undefined === options.title) throw makeTitleRequiredError(`feat create`)

  return {
    ...options,
    title: parseTitle(options.title),
    labels: appendLable(parseLabels(options.labels), `feature`)
  }
}

function parseTitle(title: string): string {
  if(title.startsWith(FEATURE_TITLE)) return title
  return [FEATURE_TITLE, title].join(' ')
}

function parseLabels(labels: string | string[] | undefined): string[] {
  if(undefined === labels) return []
  else if(`string` === typeof labels) return labels.split(',').filter(Boolean).map(s => s.trim())
  else return labels
}

function appendLable(labels: string[], label: string): string[] {
  if(labels.includes(label)) return labels
  return labels.concat(label)
}

function overrideRenameOptions(title: string): string {
  return `[Feature Request] ${title}`
}

function makeCreateTemplate(title: string): string {
  return `\
---
title: ${title}
labels: feature
---

## Is your feature request related to a problem? Please describe.

A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]


## Describe the solution you'd like

A clear and concise description of what you want to happen.


## Describe alternatives you've considered

A clear and concise description of any alternative solutions or features you've considered.


## Additional context

Add any other context or screenshots about the feature request here.
`
}
