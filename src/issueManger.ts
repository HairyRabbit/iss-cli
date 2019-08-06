import fs from 'fs'
import path from 'path'
import ini from 'ini'
import open from 'open'
import { sync as findUp } from 'find-up'
import { Optional, None, Some } from 'util-extra/container/optional'
import { Result, Err, Ok } from 'util-extra/container/result'
import unquote from 'util-extra/string/unquote'
import GitHub from './provider/github'
import { Provider, Issue, IssueOptions, ProviderConstructor, ListIssueOptions } from './provider'
import config from './config'
import Token from './token'
import * as git from 'nodegit'

interface HttpError {
  number: number,
  error: Error
}

class IssueManager {
  private root!: string
  private provider!: Provider
  constructor() {
    this.init()
  }

  private init() {
    const root = findUp(`.git`, { cwd: process.cwd(), type: 'directory' })
    if(undefined === root) throw new Error(`Can't find ".git" directory`)
    this.root = root
    const content = fs.readFileSync(path.resolve(root, 'config'), `utf-8`)
    const parsedContent = ini.parse(content)
    const keys = Object.keys(parsedContent)
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

    if(!useRemote.match(`github.com`)) throw new Error(`Unknown provider`)
    
    const githubConfig = config.readProviderConfig(GitHub.providerName)
    const ProviderConstructor: ProviderConstructor = GitHub
    const tokenReaders: [ string | undefined, string ][] = [
      [ process.env.ISSCLI_GITHUB_TOKEN, `env.ISSCLI_GITHUB_TOKEN` ],
      [ process.env.ISSCLI_TOKEN, `env.ISSCLI_TOKEN` ],
      [ process.env.GITHUB_TOKEN, `env.GITHUB_TOKEN` ],
      [ githubConfig.token, `config`]
    ]

    const tokenReader = tokenReaders.find(([ token ]) => undefined !== token)
    const [ token, from ] = undefined === tokenReader ? [ undefined, undefined ] : tokenReader
    const ma = useRemote.match(/github.com:([^\/]+)\/([^]+).git/)
    if(null === ma) throw new Error(`Unknown username and repo`)
    const [, user, repo ] = ma
    this.provider = new ProviderConstructor(Token(token, from), user, repo)
  }

  public async getToken(username: string, password: string): Promise<Result<string, Error>> {
    if(undefined === this.provider.login) {
      return Err(new Error(`Provider.login was not implement`))
    }
    
    try {
      const token = await this.provider.login(username, password)
      return Ok(token)
    } catch(e) {
      return Err(e instanceof Error ? e : new Error(e))
    }
  }

  public async deleteToken() {
    return await this.provider.signout!()
  }

  public async listIssues(options: ListIssueOptions) {
    return await this.provider.find(options)
  }

  public async getIssue(number: number): Promise<Optional<Issue>> {
    const issue: Issue | null = await this.provider.get(number)
    if(null === issue) return None
    return Some(issue)
  }

  public async createIssue(options: IssueOptions): Promise<Issue> {
    const { branch, ...createOptions } = options
    const issue = await this.provider.create(createOptions)
    if(branch) await this.checkoutBranch(branch(issue.id))
    return issue
  }

  public async toggleIssue(numbers: number[], state: `open` | `closed`): Promise<Optional<[Issue[], HttpError[]]>> {
    const dones: Issue[] = []
    const fails: HttpError[] = []

    for await (const number of numbers) {
      try {
        const issue = await this.provider.update(number, { state })
        dones.push(issue)
      } catch(e) {
        fails.push({
          number: number,
          error: e
        })
      }
    }
    
    return Some([ dones, fails ])
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

  public async checkoutBranch(branch: string): Promise<void> {
    const repo = await git.Repository.open(this.root)
    await repo.checkoutBranch(branch)
  }
}

export default new IssueManager()
