// import chalk from 'chalk'
import { Arguments, Argv } from 'yargs'
import iss from '../../issue'


export const command: string = 'add <title> [options]'
export const desc: string = 'Add a new issue'

interface CreateIssueOptions {
  title: string
  label: string[]
}

const DEFAULT_LISTBUGS_OPTIONS: CreateIssueOptions = {
  title: 'Unknown title',
  label: [],
}

export function builder(yargs: Argv<CreateIssueOptions>): void {
  yargs
    .positional('title', {
      desc: 'bug title',
      type: 'string'
    })
    .option(`label`, {
      array: true,
      type: `string`,
      alias: 'l',
      description: `add addion labels`,
      default: []
    })
}

export async function handler(args: Arguments<CreateIssueOptions>): Promise<void> {
  const options: CreateIssueOptions = {
    ...DEFAULT_LISTBUGS_OPTIONS,
    title: args.title,
    label: args.label
  }

  await iss.createIssue(options)
}
