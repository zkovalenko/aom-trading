import path from 'path';

export interface LocalDownload {
  fileName: string;
  filePath: string;
  requiresPremium?: boolean;
}

const baseDownloadDir = path.resolve(process.cwd(), 'downloads');

const downloads: LocalDownload[] = [
  {
    fileName: 'AOMtrading_1.4.2.zip',
    filePath: path.join(baseDownloadDir, 'AOMtrading_1.4.2.zip'),
  },
  {
    fileName: 'AOMtrading_1.4.10.zip',
    filePath: path.join(baseDownloadDir, 'AOMtrading_1.4.10.zip'),
  },
  {
    fileName: 'Chart_templates_1.4.2.zip',
    filePath: path.join(baseDownloadDir, 'Chart_templates_1.4.2.zip'),
  },
  {
    fileName: 'Chart_templates_1.4.10.zip',
    filePath: path.join(baseDownloadDir, 'Chart_templates_1.4.10.zip'),
  },
];

export const findLocalDownload = (fileName: string): LocalDownload | undefined => {
  console.log("~~findLocalDownload: ", fileName);
  
  const foundFile = downloads.find(download => download.fileName === fileName);
  console.log("~~found file: ", foundFile);

  return foundFile;
}

export default downloads;
