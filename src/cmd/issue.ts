import yargs from 'yargs'
import parseArgs from 'yargs-parser'

export default function main(args: string[]): void {
  // const options = parseArgs(args)

  // const args = yargs
  //   .strict()
  //   .usage('usage: $0 <command>')
  //   .commandDir('./issue')
  //   .version()
  //   .alias('v', 'version')
  //   .help()
  //   .alias('h', 'help')
  //   .argv

  //   console.log(args)
  // if(args._.length) {
  //   return
  // }

  // if(!args.number) {
  //   yargs.showHelp()
  // }
}

main(process.argv.slice(2))
