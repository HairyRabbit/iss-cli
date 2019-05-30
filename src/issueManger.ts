import fs from 'fs'
import path from 'path'
import ini from 'ini'
import open from 'open'
import { sync as findUp } from 'find-up'
import unquote from 'util-extra/string/unquote'
import prompts from 'prompts'
import GitHub from './provider/github'
import { Provider, Issue, FindOptions, CreateOptions, ProviderConstructor } from './provider'
import { Optional, None, Some } from 'util-extra/container/optional'
import config from './config'

class IssueManager {
  private provider!: Provider
  constructor() {
    this.init()
  }

  private init() {
    const root = findUp(`.git`, { cwd: process.cwd(), type: 'directory' })
    if(undefined === root) throw new Error(`Can't find ".git" directory`)
    const content: string = fs.readFileSync(path.resolve(root, 'config'), `utf-8`)
    const parsedContent: { [key: string]: any } = ini.parse(content)
    const keys: string[] = Object.keys(parsedContent)
    const [remote, remotes]: [{ [key: string]: string }, string[]] = keys
      .filter(key => key.startsWith(`remote`))
      .reduce<[{ [key: string]: string }, string[]]>(([remote, remotes], key) => {
        const value = parsedContent[key].url
        const name = unquote(key.split(' ')[1])
        remote[name] = value
        remotes.push(name)
        return [remote, remotes]
      }, [Object.create(null), []])
    
    if(0 === remotes.length) throw new Error(`no remote found`)
    const useRemote = remote.origin || remote[remotes[0]]

    if(useRemote.match(`github.com`)) {
      const githubConfig = config.readProviderConfig(`github`)
      const ProviderConstructor: ProviderConstructor = GitHub
      const token: string | undefined = undefined
        || process.env.ISSCLI_GITHUB_TOKEN 
        || process.env.ISSCLI_TOKEN 
        || process.env.GITHUB_TOKEN
        || githubConfig.token

      const ma = useRemote.match(/github.com:([^\/]+)\/([^]+).git/)
      if(null === ma) throw new Error(`Unknown username and repo`)
      const [, user, repo ] = ma
      this.provider = new ProviderConstructor(token, user, repo)
    } else {
      throw new Error(`Unknown provider`)
    }
  }

  public async getToken() {
    console.log(`Create access token from api`)
    const res = await prompts([{
      type: 'text',
      name: 'username',
      message: 'Username:'
    },{
      type: 'password',
      name: 'password',
      message: 'Password:'
    }])
    
    return await this.provider.auth(res.username, res.password)
  }

  public async listIssues(options: FindOptions) {
    return await this.provider.find(options)
  }

  public async getIssue(number: number) {
    return await this.provider.get(number)
  }

  public async createIssue(options: CreateOptions) {
    return await this.provider.create(options)
  }

  public async closeIssue(number: number) {
    return await this.provider.update(number, { state: 'closed' })
  }

  public async openIssue(number: number) {
    return await this.provider.update(number, { state: 'open' })
  }

  public async changeIssueTitle(number: number, title: string)  {
    return await this.provider.update(number, { title })
  }

  public async openBrowserIssue(number: number): Promise<Optional<[Issue, (() => void)]>> {
    const issue = await this.getIssue(number)
    if(null === issue) return None
    const fn = async () => await open(issue.url)
    return Some([issue, fn])
  }
}

export default new IssueManager()
