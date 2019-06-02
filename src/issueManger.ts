import fs from 'fs'
import path from 'path'
import ini from 'ini'
import open from 'open'
import { sync as findUp } from 'find-up'
import unquote from 'util-extra/string/unquote'
import GitHub from './provider/github'
import { Provider, Issue, FindOptions, CreateOptions, ProviderConstructor } from './provider'
import { Optional, None, Some } from 'util-extra/container/optional'
import config from './config'
import { Result, Err, Ok } from 'util-extra/container/result'

class IssueManager {
  private provider!: Provider
  constructor() {
    this.init()
  }

  private init() {
    const root: undefined | string = findUp(`.git`, { cwd: process.cwd(), type: 'directory' })
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
      const githubConfig = config.readProviderConfig(GitHub.providerName)
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

  public async getToken(username: string, password: string): Promise<Result<string, Error>> {
    if(undefined === this.provider.login) {
      return Err(new Error(`Provider.login was not implement`))
    }
    
    try {
      const token: string = await this.provider.login(username, password)
      return Ok(token)
    } catch(e) {
      return Err(e instanceof Error ? e : new Error(e))
    }
  }

  public async deleteToken() {
    return await this.provider.signout!()
  }

  public async listIssues(options: FindOptions) {
    return await this.provider.find(options)
  }

  public async getIssue(number: number): Promise<Optional<Issue>> {
    const issue: Issue | null = await this.provider.get(number)
    if(null === issue) return None
    return Some(issue)
  }

  public async createIssue(options: CreateOptions) {
    return await this.provider.create(options)
  }

  public async toggleIssue(number: number, state: `open` | `closed`): Promise<Optional<Issue>> {
    const issue: Issue | null = await this.provider.update(number, { state })
    if(null === issue) return None
    return Some(issue)
  }

  public async changeIssueTitle(number: number, title: string): Promise<Optional<Issue>> {
    const issue: Issue | null = await this.provider.update(number, { title })
    if(null === issue) return None
    return Some(issue)
  }

  public async openBrowserIssue(number: number): Promise<Optional<[Issue, (() => void)]>> {
    try {
      const issue = (await this.getIssue(number)).unwrap()
      const fn = async () => await open(issue.url)
      return Some([issue, fn])
    } catch(e) {
      return None
    }
  }
}

export default new IssueManager()
