import { type GETFetcher } from '@octodevs/octodrive-sdk'
import { fetch } from 'undici'

const getFetcher: GETFetcher = async ({ url }) =>
  await fetch(url).then(async (res) => new Uint8Array(await res.arrayBuffer()))

export default getFetcher
