import type { FastifyReply, FastifyRequest } from 'fastify'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { join } from 'path'

const deleteFile =
  (storagePath: string) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { fileId } = request.params as { fileId: string }

    const isHexdemical = fileId.match(/[0-9a-z]/g) !== null
    if (fileId === undefined || !isHexdemical) {
      void reply
        .code(400)
        .header('Content-Type', 'application/json')
        .send({ success: false, reason: 'FILENAME_MUST_BE_HEX' })

      return
    }

    const path = join(storagePath, 'files', fileId)

    if (existsSync(path)) {
      await unlink(path)
    }

    void reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send({ success: true })
  }

export default deleteFile
