import path from 'path'
import fs from 'fs'
import os from 'os'
import ini from 'ini'

export interface ProviderConfig {
  user: string
  token: string
}

export interface CliConfig {
  max: number
}

export interface Config {
  cli: Partial<CliConfig>
  provider: {
    [provider: string]: Partial<ProviderConfig>
  }
}

class ConfigManager {
  public path: string

  constructor(private filename: string = `.iss-cli`) {
    this.filename = filename
    this.path = path.resolve(os.homedir(), this.filename)
    this.init()
  }

  private init() {
    if(!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, ``, `utf-8`)
    }
  }

  public read(): Config {
    const content: string = fs.readFileSync(this.path, `utf-8`)
    return ini.parse(content) as Config
  }

  public readCliConfig(): Partial<CliConfig> {
    return this.read().cli
  }

  public readProviderConfig(provider: string): Partial<ProviderConfig> {
    const providers = this.read().provider || {}
    return providers[provider] || {}
  }

  public write(content: Config): void {
    const config: string = ini.stringify(content)
    fs.writeFileSync(this.path, config, `utf-8`)
  }

  private writeProviderProperties(provider: string, properties: Partial<ProviderConfig>) {
    const config: Config = this.read()
    config.provider = config.provider || {}
    config.provider[provider] = {
      ...config.provider[provider],
      ...properties
    }
    this.write(config)
  }

  public writeProviderToken(provider: string, token: string): void {
    this.writeProviderProperties(provider, { token })
  }

  public writeProvider(provider: string, config: ProviderConfig): void {
    this.writeProviderProperties(provider, config)
  }

  public deleteProviderToken(provider: string) {
    this.writeProviderProperties(provider, { token: undefined })
  }

  public writeCli<K extends keyof CliConfig>(key: K, value: CliConfig[K]): void {
    const config: Config = this.read()
    config.cli = config.cli || {}
    config.cli[key] = value
    this.write(config)
  }
}

export default new ConfigManager()
