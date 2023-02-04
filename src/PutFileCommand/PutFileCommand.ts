import {
  APIWrapBuilder,
  EncryptedData,
  hashSHA3,
  type Metadata,
  type APIWrapper,
} from '@octodevs/octodrive-sdk'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import getFetcher from '../HTTPClient/getFetcher'
import postFetcher from '../HTTPClient/postFetcher'
import Logger from '../Logger/Logger'

export default class PutFileCommand {
  private readonly wrapper: APIWrapper

  constructor(
    server: string,
    private readonly source: string,
    private readonly destination: string,
    private readonly username: string,
    private readonly password: string
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

    let fileContent: Buffer

    try {
      fileContent = await readFile(resolve(this.source))
    } catch (e) {
      Logger.error('File read failed...', e)

      process.exit(-1)
    }

    const file = EncryptedData.encrypt(
      new Uint8Array(
        fileContent.buffer,
        fileContent.byteOffset,
        fileContent.byteLength / Uint8Array.BYTES_PER_ELEMENT
      ),
      this.password
    )

    let fileId: string

    try {
      fileId = await this.wrapper.postFile(file)
    } catch (e) {
      Logger.error('Upload failed...', e)
      process.exit(-1)
    }

    metadata.set(this.destination, fileId)

    const encrypted = EncryptedData.encrypt(metadata.serialize(), this.password)
    Logger.verbose('metadata file has been encrypted')

    try {
      await this.wrapper.postMetadata(metadataId, encrypted)
      Logger.success('Upload complete')
    } catch (e) {
      Logger.error('Updating metadata failed...', e)
      process.exit(-1)
    }
  }
}
