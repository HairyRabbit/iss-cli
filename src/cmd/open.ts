// import chalk from 'chalk'
import { Arguments, Argv } from 'yargs'
import iss from '../issue'

export const command: string = 'open <id> [options]'
export const desc: string = 'Reopen a issue by id'

interface Options {
  id: number
}

export function builder(yargs: Argv<Options>): void {
  yargs
    .positional('id', {
      desc: 'issue id',
      type: 'number'
    })
}

export async function handler(args: Arguments<Options>): Promise<void> {
  const id: number = args.id
  await iss.openIssue(id)
  console.log(`Opened #${id}`)
}
