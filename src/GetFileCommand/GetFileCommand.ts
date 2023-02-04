import {
  APIWrapBuilder,
  hashSHA3,
  type Metadata,
  type APIWrapper,
  type EncryptedData,
} from '@octodevs/octodrive-sdk'
import { existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import { basename } from 'path'
import getFetcher from '../HTTPClient/getFetcher'
import Logger from '../Logger/Logger'

export default class GetFileCommand {
  private readonly wrapper: APIWrapper

  constructor(
    server: string,
    private readonly source: string,
    private readonly username: string,
    private readonly password: string,
    private readonly force: boolean
  ) {
    this.wrapper = new APIWrapBuilder()
      .setBaseURL(server)
      .setGetFetcher(getFetcher)
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

    let file: EncryptedData

    try {
      file = await this.wrapper.getFile(fileId)
    } catch (e) {
      Logger.error('Getting file data failed...', e)

      process.exit(-1)
    }

    try {
      const filename = basename(this.source)

      if (existsSync(filename) && !this.force) {
        Logger.error(
          `File ${filename} already exists in this directory. use --force to override`
        )

        process.exit(-1)
      }

      await writeFile(basename(this.source), file.decrypt(this.password))
      Logger.success('File downloaded successfully!')
    } catch (e) {
      Logger.error('File write failed...', e)
      process.exit(-1)
    }
  }
}
