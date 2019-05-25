import { Arguments, Argv } from 'yargs'
import iss from '../issue'

export const command: string = 'see <id>'
export const desc: string = 'Open a issue with browser by id'

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
  const link = await iss.openBrowserIssue(id)
  console.log(`Open browser and visite #${link}`)
}
