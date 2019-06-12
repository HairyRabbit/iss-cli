import chalk from 'chalk'

export function makeUnknownCommandError(command: string): Error {
  return new Error(`Unknown command "${command}"`)
}

export function makeNotFeatureTitle(number: number): Error {
  return new Error(`\
This issue not a ${chalk.bold(`feature request`)}, try to run:

  $ iss ${number}

get issue details`)
}

export function makeTitleRequiredError(command: string): Error {
  return new Error(`\
${chalk.bold(command)} title was required
`)
}

export function makeAuthenticationError(token: string, from: string): Error {
  return new Error(`\
Authentication failed

Token: ${token}
From: ${from}
`)
}
