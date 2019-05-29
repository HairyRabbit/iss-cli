import open from 'open'
import GitHub from './provider/github'
import { Provider, FindOptions, Issue } from './provider'
import { Optional, None, Some } from 'util-extra/container/optional'

class IssueHost {
  constructor(private provider: Provider) {}

  public async listIssues(options: FindOptions) {
    return await this.provider.find(options)
  }

  public async getIssue(number: number) {
    return await this.provider.get(number)
  }

  public async createIssue(options: any) {
    return await this.provider.create(options)
  }

  public async closeIssue(number: number) {
    return await this.provider.update(number, { state: 'closed' })
  }

  public async openIssue(number: number) {
    return await this.provider.update(number, { state: 'open' })
  }

  public async openBrowserIssue(number: number): Promise<Optional<[Issue, (() => void)]>> {
    const issue = await this.getIssue(number)
    if(null === issue) return None
    const fn = async () => await open(issue.url)
    return Some([issue, fn])
  }
}

export const github = new IssueHost(new GitHub)
export default github
