// import chalk from 'chalk'
import { Arguments, Argv } from 'yargs'
import iss from '../../issue'

export const command: string = 'close <id> [options]'
export const desc: string = 'Close a issue by id'

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
  const id = args.id
  await iss.closeIssue(id)
  console.log(`Closed #${id}`)
}
