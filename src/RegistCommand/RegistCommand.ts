import postFetcher from '../HTTPClient/postFetcher'
import {
  APIWrapBuilder,
  EncryptedData,
  hashSHA3,
  Metadata,
  type APIWrapper,
} from '@octodevs/octodrive-sdk'
import getFetcher from '../HTTPClient/getFetcher'
import Logger from '../Logger/Logger'

export default class RegistCommand {
  private readonly wrapper: APIWrapper

  constructor(
    server: string,
    private readonly username: string,
    private readonly password: string,
    private readonly force: boolean
  ) {
    this.wrapper = new APIWrapBuilder()
      .setBaseURL(server)
      .setGetFetcher(getFetcher)
      .setPostFetcher(postFetcher)
      .build()
  }

  public async run(): Promise<void> {
    const metadataId = hashSHA3(`${this.username}\x00${this.password}`)
    Logger.verbose('Calculated metadataId:', metadataId)

    try {
      await this.wrapper.getMetadataById(metadataId, this.password)

      if (!this.force) {
        Logger.error('Metadata already exists. to override use --force flag')
        process.exit(-1)
      }
    } catch {}

    const metadata = new Metadata()
    Logger.verbose('new Metadata object created')

    const encrypted = EncryptedData.encrypt(metadata.serialize(), this.password)
    Logger.verbose('metadata file has been encrypted')

    try {
      await this.wrapper.postMetadata(metadataId, encrypted)
      Logger.success('registration complete')
    } catch (e) {
      Logger.error('Registration failed...', e)
      process.exit(-1)
    }
  }
}
