const fs = require('fs');
const chalk = require('chalk');

const MAX_BYTES = 13312;
const filename = './dist/game.zip';

function getFilesizeInBytes(filename)
{
    return fs.statSync(filename).size;
}

function fileIsUnderMaxSize(fileSize)
{
    return fileSize <= MAX_BYTES;
}

fileSize = getFilesizeInBytes(filename);
fileSizeDifference = Math.abs(MAX_BYTES - fileSize);

if (fileIsUnderMaxSize(fileSize))
{
    console.log(chalk.green(`Hooray! The file is ${fileSize} bytes (${fileSizeDifference} bytes under the limit).`));
    console.log(chalk.green(`USED: ${(fileSize / MAX_BYTES * 100).toFixed(2)} %`));
    console.log(chalk.green(`LEFT: ${((MAX_BYTES - fileSize) / MAX_BYTES * 100).toFixed(2)} %`));
    process.exit(0);
} else
{
    console.log(chalk.red(`Nuts! The file is ${fileSize} bytes (${fileSizeDifference} bytes over the limit).`));
    process.exit(1);
}
