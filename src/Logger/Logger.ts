import chalk from 'chalk'

const Logger = {
  verbose: (...message: any[]) => {
    console.log(chalk.bgGray(' verbose '), chalk.gray(...message))
  },
  info: (...message: any[]) => {
    console.log(chalk.bgBlue(' info '), ...message)
  },
  error: (...message: any[]) => {
    console.log(chalk.bgRed(' ERROR '), ...message)
  },
  success: (...message: any[]) => {
    console.log(chalk.bgGreen(' SUCCESS '), ...message)
  },
}

export default Logger
