import { type DELETEFetcher } from '@octodevs/octodrive-sdk'
import { fetch } from 'undici'

const deleteFetcher: DELETEFetcher = async ({ url }) =>
  await fetch(url, { method: 'DELETE' }).then(
    async (res) => new Uint8Array(await res.arrayBuffer())
  )

export default deleteFetcher
