import { fetch, FormData } from 'undici'
import { type POSTFetcher } from '@octodevs/octodrive-sdk'

const postFetcher: POSTFetcher = async ({ url, fileData, fileName }) => {
  const body = new FormData()
  body.append(
    'data',
    new Blob([fileData], { type: 'application/octet-stream' }),
    fileName
  )

  return await fetch(url, {
    method: 'POST',
    body,
  }).then(async (res) => new Uint8Array(await res.arrayBuffer()))
}

export default postFetcher
