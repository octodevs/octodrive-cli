import { dirname, join } from 'path'
import { randomBytes } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { existsSync } from 'fs'

const postFile =
  (storagePath: string) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { type } = request.query as { type: 'FILES' | 'METADATAS' }

    if (!['FILES', 'METADATAS'].includes(type)) {
      void reply
        .code(400)
        .header('Content-Type', 'application/json')
        .send({ success: false, reason: 'TYPE_NOT_PROVIDED_OR_INVALID' })

      return
    }

    const file = await request.file()
    if (file === undefined) {
      void reply
        .code(400)
        .header('Content-Type', 'application/json')
        .send({ success: false, reason: 'FILE_NOT_PROVIDED' })

      return
    }

    const isHexdemical = file.filename.match(/[0-9a-f]/g) !== null
    if (type === 'METADATAS' && !isHexdemical) {
      void reply
        .code(400)
        .header('Content-Type', 'application/json')
        .send({ success: false, reason: 'METADATA_FILENAME_MUST_BE_HEX' })

      return
    }

    const fileRawPath: string[] = [storagePath, type.toLowerCase()]

    if (type === 'METADATAS') {
      fileRawPath.push(file.filename)
    }

    if (type === 'FILES') {
      fileRawPath.push(randomBytes(32).toString('hex'))
    }

    const filePath = join(...fileRawPath)

    await ensureDirectoryExistence(filePath)
    await writeFile(filePath, file.file)

    void reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send({
        success: true,
        path: fileRawPath[fileRawPath.length - 1],
      })
  }

const ensureDirectoryExistence = async (filePath: string): Promise<void> => {
  const dir = dirname(filePath)

  if (existsSync(dir)) {
    return
  }

  await ensureDirectoryExistence(dir)
  await mkdir(dir)
}

export default postFile
