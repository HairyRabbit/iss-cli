import parseArgs, { Arguments } from 'yargs-parser'
import { renderError, renderLicenseAndCopyright, renderFooter } from '../render'
import { Command } from '../argv'

export default function makeCli(name: string, command: { [key: string]: Command }) {
  return (args: string[], pkg: { [key: string]: any }): void => {
    const options: Arguments = parseArgs(args, {
      boolean: [ 'help', 'version' ],
      alias: { 
        help: 'h',
        version: 'v'
      },
      default: {
        help: false,
        version: false
      }
    })

    const cmds: string[] = options._
    if(options.version) return printVersion(pkg.version)
    else if(0 === cmds.length) return printHelper(name, pkg)

    try {
      const cmd = command[cmds[0]] || command._
      if(cmd.isSubCommand) args.shift()
      cmd.handler(args, { ...cmd.options, name })
    } catch(e) {
      printHelper(name, pkg)
      renderError(e)
    }
  }
}


function printHelper(name: string, pkg: { [key: string]: any }): void {
  console.log(`
Usage: 

${name} <number> [options]
${name} <command> [commandOptions]

Commands:

${name} <number>            - Show issue detail
${name} ls                  - List issues
${name} add <title>         - Create new issue
${name} rename <number>     - Update issue title
${name} close <number>      - Close issue
${name} open <number>       - Open issue
${name} see <number>        - Visit issue link by browser
${name} login               - Login and create access token

Options:

--help, -h              - Show helper
--version, -v           - Print CLI version

Providers:

local                   - Use local storage
github                  - Github API https://github.com
gitlab                  - Gitlab API https://gitlab.com

Environment Variables:

ISSCLI_TOKEN            - current provider access token
ISSCLI_{PROVIDER}_TOKEN - token for different provider, e.g ISSCLI_GITHUB_TOKEN
{PROVIDER}_TOKEN        - token for different provider, e.g GITHUB_TOKEN

${renderLicenseAndCopyright(pkg.author, pkg.license)}


${renderFooter()}
`)
}

function printVersion(version: string): void {
  console.log(`Version ${version}`)
}
