import {
  APIWrapBuilder,
  hashSHA3,
  type Metadata,
  type APIWrapper,
  EncryptedData,
} from '@octodevs/octodrive-sdk'
import deleteFetcher from '../HTTPClient/deleteFetcher'
import getFetcher from '../HTTPClient/getFetcher'
import postFetcher from '../HTTPClient/postFetcher'
import Logger from '../Logger/Logger'

export default class RemoveFileCommand {
  private readonly wrapper: APIWrapper

  constructor(
    server: string,
    private readonly source: string,
    private readonly username: string,
    private readonly password: string
  ) {
    this.wrapper = new APIWrapBuilder()
      .setBaseURL(server)
      .setGetFetcher(getFetcher)
      .setPostFetcher(postFetcher)
      .setDeleteFetcher(deleteFetcher)
      .build()
  }

  public async run(): Promise<void> {
    const metadataId = hashSHA3(`${this.username}\x00${this.password}`)
    Logger.verbose('Calculated metadataId:', metadataId)

    let metadata: Metadata
    try {
      metadata = await this.wrapper.getMetadataById(metadataId, this.password)
    } catch (e) {
      Logger.error('Getting metadata failed...', e)
      Logger.info('Maybe not registed user or wrong username/password.')
      Logger.info(
        'Use octodrive-cli regist -u <username> -p <password> to regist user'
      )

      process.exit(-1)
    }

    const fileId = metadata.get(this.source)
    if (fileId === undefined) {
      Logger.error(`File ${this.source} not found`)
      process.exit(-1)
    }

    try {
      await this.wrapper.deleteFile(fileId)
    } catch (e) {
      Logger.error('Removing file failed...', e)
      process.exit(-1)
    }

    metadata.delete(this.source)

    const encrypted = EncryptedData.encrypt(metadata.serialize(), this.password)
    Logger.verbose('metadata file has been encrypted')

    try {
      await this.wrapper.postMetadata(metadataId, encrypted)
      Logger.success('Remove file complete')
    } catch (e) {
      Logger.error('Updating metadata failed...', e)
      process.exit(-1)
    }
  }
}
