import { makeCommand } from '../argv'
import listIssue from '../command/list'
import showIssue from '../command/show'
import createIssue from '../command/create'
import { openIssue, closeIssue } from '../command/toggle'
import browseIssue from '../command/browse'
import renameIssue from '../command/rename'
import loginIssue from '../command/login'
import makeCli from '../command/main'

export default makeCli(`iss`, {
  ls: makeCommand(true, listIssue),
  cat: makeCommand(false, showIssue),
  add: makeCommand(true, createIssue),
  open: makeCommand(true, openIssue),
  close: makeCommand(true, closeIssue),
  see: makeCommand(true, browseIssue),
  rename: makeCommand(true, renameIssue),
  login: makeCommand(true, loginIssue)
})
