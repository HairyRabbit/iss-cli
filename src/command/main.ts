import parseArgs, { Arguments } from 'yargs-parser'
import { renderError, renderLicenseAndCopyright, renderFooter, renderCommands } from '../render'
import { Command, hasNoOptions } from '../argv'

export default function makeCli(name: string, command: { [key: string]: Command }) {
  return (args: string[], pkg: { [key: string]: any }): void => {
    const options: Arguments = parseArgs(args, {
      boolean: [ 'version' ],
      alias: { 
        version: 'v'
      },
      default: {
        version: false
      }
    })

    const cmdsDesc: [string, string][] = transformToCommandsRender(command)
    const cmds: string[] = options._
    if(options.version) return printVersion(pkg.version)
    else if(0 === cmds.length && hasNoOptions(options)) return printHelper(name, pkg, cmdsDesc)

    try {
      const cmd = command[cmds[0]] || command._
      if(cmd.isSubCommand) args.shift()
      cmd.handler(args, { ...cmd.options, name })
    } catch(e) {
      renderError(e)
    }
  }
}


function transformToCommandsRender(commands: { [key: string]: Command }): [string, string][] {
  const acc: [string, string][] = []
  for (const key in commands) {
    if (commands.hasOwnProperty(key)) {
      const command = commands[key]
      acc.push([command.command, command.description])
    }
  }
  return acc
}

function printHelper(name: string, pkg: { [key: string]: any }, cmds: [string, string][]): void {
  console.log(`
Usage: 

${name} <number> [options]
${name} <command> [commandOptions]

Commands:

${renderCommands(cmds)}

Options:

--version, -v           - Print CLI version

Providers:

github                  - Github API https://github.com
gitlab(todo)            - Gitlab API https://gitlab.com
local(todo)             - Use local storage

Environment Variables:

ISSCLI_TOKEN            - current provider access token, weight 0.
ISSCLI_{PROVIDER}_TOKEN - token for different provider, weight 1. e.g ISSCLI_GITHUB_TOKEN
{PROVIDER}_TOKEN        - token for different provider, weight 2. e.g GITHUB_TOKEN
ISSCLI_EDITOR           - editor for edit text, weight 0.
EDITOR                  - editor, weight 1

${renderLicenseAndCopyright(pkg.author, pkg.license)}


${renderFooter()}
`)
}

function printVersion(version: string): void {
  console.log(`Version ${version}`)
}
