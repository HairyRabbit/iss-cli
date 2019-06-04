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
  _: makeCommand(`iss <number>`, `Show issue detail`, false, showIssue),
  ls: makeCommand(`iss ls`, `List issues`, true, listIssue),
  add: makeCommand(`iss add <title>`, `Create new issue`, true, createIssue),
  open: makeCommand(`iss open <number>`, `Open issue`, true, openIssue),
  close: makeCommand(`iss close <number>`, `Close issue`, true, closeIssue),
  see: makeCommand(`iss see <number>`, `Visit issue link by browser`, true, browseIssue),
  rename: makeCommand(`iss rename <number>`, `Update issue title`, true, renameIssue),
  login: makeCommand(`iss login`, `Login and create access token`, true, loginIssue)
})
