import { google } from 'googleapis';
import { Readable } from 'stream';

let drive: any;

/**
 * Initialize Google Drive client once
 */
function getDriveClient() {
  if (!drive) {
    const auth = new google.auth.GoogleAuth({
      keyFile: './aomtrading-download.json',
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    drive = google.drive({ version: 'v3', auth });
  }
  return drive;
}

/**
 * Start a file download from Google Drive
 * @param fileId Google Drive file ID
 * @returns Google API response with a readable stream
 */
export async function startDownload(fileId: string): Promise<{ data: Readable } | null> {
  try {
    const driveClient = getDriveClient();

    const meta = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, capabilities, size',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log(meta.data);

    const driveResponse = await driveClient.files.get(
      {
        fileId,
        alt: 'media',
        acknowledgeAbuse: true,
        supportsAllDrives: true,
      },
      { responseType: 'stream' }   // this is what makes .data a stream
    );

    console.log('Response type:', typeof driveResponse.data);
    console.log('Keys:', Object.keys(driveResponse.data || {}));

    return driveResponse;
  } catch (error: any) {
    console.error('❌ Error downloading from Drive:', error?.response?.data || error?.message || error);
    throw error;
  }
}
