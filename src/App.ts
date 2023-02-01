#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { ServerCommand } from './ServerCommand/ServerCommand'

void yargs(hideBin(process.argv))
  .command(
    'run-server',
    'Run standalone OctoDrive server',
    (args) =>
      args
        .option('port', {
          alias: ['p'],
          describe: 'Server listening port',
          default: 3000,
        })
        .option('host', {
          alias: ['h'],
          describe: 'Server listening host',
          default: '0.0.0.0',
        })
        .option('storagePath', {
          alias: ['s', 'path'],
          describe: 'Encrypted file storage path',
          default: './storage',
        }),
    ({ port, host, storagePath }) => {
      console.log(`Server is now online at http://${host}:${port}`)
      console.log(`using '${storagePath}' to store encrypted data`)

      new ServerCommand(host, port, storagePath).run()
    }
  )
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .parse()
