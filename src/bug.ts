import GitHub from './provider/github'

class Bugger {
  private provider: GitHub
  constructor() {
    this.provider = new GitHub()
  }

  public async listBugs() {
    return await this.provider.find()
  }

  public async getBug(number: number) {
    return await this.provider.get(number)
  }
}

export default new Bugger()
