import { google } from 'googleapis';
import type { drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { loadEnvironmentVariables } from '../config/env';

let drive: drive_v3.Drive | null = null;

/**
 * Initialize Google Drive client once using environment credentials
 */
function getDriveClient() {
  if (!drive) {
    loadEnvironmentVariables();

    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const type = process.env.GOOGLE_TYPE;

    if (!privateKey || !clientEmail || !projectId || !type) {
      throw new Error('Google Drive credentials are not fully configured.');
    }

    const credentials = {
      type,
      project_id: projectId,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: clientEmail,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER,
      client_x509_cert_url: process.env.GOOGLE_CLIENTCERT_URL,
      universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
    } as const;

    const auth = new google.auth.GoogleAuth({
      credentials,
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

    const meta = await driveClient.files.get({
      fileId,
      fields: 'id, name, mimeType, capabilities, size',
      supportsAllDrives: true,
    });

    console.log('📁 Google Drive file metadata:', {
      id: meta.data.id,
      name: meta.data.name,
      mimeType: meta.data.mimeType,
      size: meta.data.size,
    });

    const driveResponse = await driveClient.files.get(
      {
        fileId,
        alt: 'media',
        acknowledgeAbuse: true,
        supportsAllDrives: true,
      },
      { responseType: 'stream' }
    );

    const stream = driveResponse.data as unknown as Readable;

    return { data: stream };
  } catch (error: any) {
    console.error('❌ Error downloading from Drive:', error?.response?.data || error?.message || error);
    throw error;
  }
}
