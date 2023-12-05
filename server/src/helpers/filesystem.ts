import fs from 'fs';

export const readFile = async (fileName: fs.PathOrFileDescriptor) => {
  return new Promise<any>((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        reject(`Error reading the file: ${err}`)
        return;
      }

      resolve(data)
    });
  })
}