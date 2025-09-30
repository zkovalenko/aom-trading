import { Request, Response } from 'express';
import { startDownload } from '../services/softwareDownloadService';

export const download = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId, fileName } = req.body; // ✅ body is an object, not a function
    if (!fileId || !fileName) {
      res.status(400).json({ success: false, message: 'Missing fileId or filename' });
      return;
    }

    const response = await startDownload(fileId);

    if (!response || !response.data) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );
    res.setHeader('Content-Type', 'application/zip');
    // res.setHeader('Content-Length', '200715');

    // stream it to the user
    response.data.pipe(res);

    response.data.on('end', () => {
      console.log('✅ File download completed');
    });

    response.data.on('error', (err: any) => {
      console.error('❌ Stream error:', err);
      if (!res.headersSent) {
        res.status(500).send('File download failed');
      }
    });
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
