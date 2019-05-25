import open from 'open'
import GitHub from './provider/github'
import { FindOptions } from './provider'

class Issues {
  private provider: GitHub

  constructor() {
    this.provider = new GitHub()
  }

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

  public async openBrowserIssue(number: number): Promise<string | null> {
    const issue = await this.getIssue(number)
    if(null === issue) return null
    await open(issue.url)
    return issue.url
  }
}

export default new Issues()
