import yargs from 'yargs'
import pkg from '../package.json'
import getHandler from './cmd/cat'

export default function main() {
  yargs
    .strict()    
    .commandDir('./cmd')
    .command({
      command: '$0 [number] [options]',
      handler
    })
    .version()
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    // .showHelp()
    .argv
}

function handler(args: any) {
  const number = args.number

  if(!number) {
    yargs
      .usage(pkg.description)
      .epilog('© HairyRabbit')
      .showHelp()
    return
  }

  getHandler(number)
}

main()