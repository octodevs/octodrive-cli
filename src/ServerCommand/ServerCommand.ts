import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyMultipart from '@fastify/multipart'
import { FILE_API_ENDPOINT } from '@octodevs/octodrive-sdk'
import postFile from './routes/postFile'
import deleteFile from './routes/deleteFile'

export class ServerCommand {
  private readonly server = fastify({ logger: true })

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly storagePath: string
  ) {}

  public run(): void {
    void this.server.register(fastifyMultipart)
    void this.server.register(fastifyStatic, {
      root: this.storagePath,
    })

    void this.server.post(FILE_API_ENDPOINT(), postFile(this.storagePath))
    void this.server.delete(
      FILE_API_ENDPOINT(':fileId'),
      deleteFile(this.storagePath)
    )

    void this.server.listen({
      port: this.port,
      host: this.host,
    })
  }
}
