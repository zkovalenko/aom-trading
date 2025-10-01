import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { findLocalDownload } from '../config/softwareDownloads';

const streamLocalFile = (filePath: string, fileName: string, res: Response) => {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('File not found on server');
  }

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/zip');

  const stream = fs.createReadStream(absolutePath);
  stream.pipe(res);

  stream.on('end', () => {
    console.log(`✅ Completed download for ${fileName}`);
  });

  stream.on('error', (error) => {
    console.error('❌ Stream error:', error);
    if (!res.headersSent) {
      res.status(500).send('File download failed');
    }
  });
};

export const download = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.body; // ✅ body is an object, not a function
    if (!fileName) {
      res.status(400).json({ success: false, message: 'Missing fileId or filename' });
      return;
    }

    console.log("~~calling findLocalDownload");
    const localDownload = findLocalDownload(fileName);

    if (localDownload) {
      streamLocalFile(localDownload.filePath, localDownload.fileName, res);
      return;
    }

    res.status(404).json({ success: false, message: 'File not found' });
    return;
  } catch (error: any) {
    console.error('❌ Download error:', error?.response?.data || error?.message || error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error?.response?.data?.error?.message || 'Failed to download file.'
      });
    }
  }
};

export default { download };
