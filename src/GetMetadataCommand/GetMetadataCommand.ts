import {
  APIWrapBuilder,
  hashSHA3,
  type APIWrapper,
} from '@octodevs/octodrive-sdk'
import getFetcher from '../HTTPClient/getFetcher'
import Logger from '../Logger/Logger'

export default class GetMetadataCommand {
  private readonly wrapper: APIWrapper

  constructor(
    server: string,
    private readonly username: string,
    private readonly password: string
  ) {
    this.wrapper = new APIWrapBuilder()
      .setBaseURL(server)
      .setGetFetcher(getFetcher)
      .build()
  }

  public async run(): Promise<void> {
    const metadataId = hashSHA3(`${this.username}\x00${this.password}`)
    Logger.verbose('Calculated metadataId:', metadataId)

    try {
      const metadata = await this.wrapper.getMetadataById(
        metadataId,
        this.password
      )
      console.log(`Found ${metadata.size} files`)

      for (const [logicalPath, physicalPath] of metadata) {
        console.log(`${logicalPath} ~> ${physicalPath}`)
      }
    } catch (e) {
      Logger.error('Getting metadata failed...', e)
      Logger.info('Maybe not registed user or wrong username/password.')
      Logger.info(
        'Use octodrive-cli regist -u <username> -p <password> to regist user'
      )

      process.exit(-1)
    }
  }
}
