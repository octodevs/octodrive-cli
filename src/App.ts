#!/usr/bin/env node
import yargs from 'yargs'
import prompts from 'prompts'
import { hideBin } from 'yargs/helpers'
import { ServerCommand } from './ServerCommand/ServerCommand'
import RegistCommand from './RegistCommand/RegistCommand'
import GetMetadataCommand from './GetMetadataCommand/GetMetadataCommand'
import PutFileCommand from './PutFileCommand/PutFileCommand'
import GetFileCommand from './GetFileCommand/GetFileCommand'
import RemoveFileCommand from './RemoveFileCommand/RemoveFileCommand'
import Logger from './Logger/Logger'

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
          default: '127.0.0.1',
        })
        .option('storagePath', {
          alias: ['s', 'storage'],
          describe: 'Encrypted file storage path',
          default: './storage',
        }),
    ({ port, host, storagePath }) => {
      new ServerCommand(host, port, storagePath).run()

      Logger.success(`Server is now online at http://${host}:${port}`)
      Logger.info(`using '${storagePath}' to store encrypted data`)
    }
  )
  .command(
    'regist',
    'Regist new user',
    (args) =>
      args
        .option('server', {
          alias: ['s'],
          type: 'string',
          default: 'http://127.0.0.1:3000',
        })
        .option('force', {
          alias: ['f'],
          type: 'boolean',
          default: false,
        })
        .option('username', {
          alias: ['u', 'user'],
          type: 'string',
        })
        .demandOption(['username'], 'Please provide username'),
    async ({ server, username, force }) => {
      const response = await prompts(
        {
          type: 'password',
          name: 'password',
          message: `Please enter ${username}'s password`,
          validate: (value: string) =>
            value.length < 16
              ? 'Minimum password length: 16'
              : value.match(/[a-z]/) === null
              ? 'Require at least one lowercase letter'
              : value.match(/[A-Z]/) === null
              ? 'Require at least one uppercase letter'
              : value.match(/[0-9]/) === null
              ? 'Require at least one number'
              : value.match(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/) === null
              ? 'Require at least one of the following characters: !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
              : value === username ||
                value === username.split('').reverse().join('')
              ? 'Require that the password must not be the user name or user name in reverse'
              : true,
        },
        {
          onCancel: () => true,
        }
      )

      void new RegistCommand(server, username, response.password, force).run()
    }
  )
  .command(
    'list',
    'Get metadata file and list all files',
    (args) =>
      args
        .option('server', {
          alias: ['s'],
          type: 'string',
          default: 'http://127.0.0.1:3000',
        })
        .option('username', {
          alias: ['u', 'user'],
          type: 'string',
        })
        .demandOption(['username'], 'Please provide username'),
    async ({ server, username }) => {
      const response = await prompts(
        {
          type: 'password',
          name: 'password',
          message: `Please enter ${username}'s password`,
        },
        {
          onCancel: () => true,
        }
      )

      void new GetMetadataCommand(server, username, response.password).run()
    }
  )
  .command(
    'get <source>',
    'Get source file from encrypted storage',
    (args) =>
      args
        .positional('source', { type: 'string' })
        .option('server', {
          alias: ['s'],
          type: 'string',
          default: 'http://127.0.0.1:3000',
        })
        .option('username', {
          alias: ['u', 'user'],
          type: 'string',
        })
        .option('force', {
          alias: ['f'],
          type: 'boolean',
          default: false,
        })
        .demandOption(
          ['source', 'username'],
          'Please provide source, username'
        ),
    async ({ server, source, username, force }) => {
      const response = await prompts(
        {
          type: 'password',
          name: 'password',
          message: `Please enter ${username}'s password`,
        },
        { onCancel: () => true }
      )

      void new GetFileCommand(
        server,
        source,
        username,
        response.password,
        force
      ).run()
    }
  )
  .command(
    'put <source> <destination>',
    'Put source file to destination at encrypted storage',
    (args) =>
      args
        .positional('source', { type: 'string' })
        .positional('destination', { type: 'string' })
        .option('server', {
          alias: ['s'],
          type: 'string',
          default: 'http://127.0.0.1:3000',
        })
        .option('username', {
          alias: ['u', 'user'],
          type: 'string',
        })
        .demandOption(
          ['source', 'destination', 'username'],
          'Please provide source, destination, username'
        ),
    async ({ server, source, destination, username }) => {
      const response = await prompts(
        {
          type: 'password',
          name: 'password',
          message: `Please enter ${username}'s password`,
        },
        { onCancel: () => true }
      )

      void new PutFileCommand(
        server,
        source,
        destination,
        username,
        response.password
      ).run()
    }
  )
  .command(
    'rm <source>',
    'Remove source file from encrypted storage',
    (args) =>
      args
        .positional('source', { type: 'string' })
        .option('server', {
          alias: ['s'],
          type: 'string',
          default: 'http://127.0.0.1:3000',
        })
        .option('username', {
          alias: ['u', 'user'],
          type: 'string',
        })
        .demandOption(
          ['source', 'username'],
          'Please provide source, username'
        ),
    async ({ server, source, username }) => {
      const response = await prompts(
        {
          type: 'password',
          name: 'password',
          message: `Please enter ${username}'s password`,
        },
        { onCancel: () => true }
      )

      void new RemoveFileCommand(
        server,
        source,
        username,
        response.password
      ).run()
    }
  )
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .parse()
