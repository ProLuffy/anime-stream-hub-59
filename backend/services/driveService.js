import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const driveService = {
  // Initialize Auth
  getAuth: async () => {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
       console.warn("Google Drive Credentials missing. Running in MOCK mode.");
       return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });
    return auth;
  },

  // Upload File
  uploadFile: async (filePath, fileName, mimeType, folderId) => {
    const auth = await driveService.getAuth();
    if (!auth) {
        // Return Mock URL with path structure simulation
        const mockPath = folderId ? `folder-${folderId}/${fileName}` : fileName;
        return `https://mock-drive.com/AnimeCrew/${mockPath}`;
    }

    const drive = google.drive({ version: 'v3', auth });

    try {
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : [], // Optional: Upload to specific folder
      };
      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      // Make file publicly readable (reader)
      await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
              role: 'reader',
              type: 'anyone',
          }
      });

      // Return a direct download link or streamable link
      // webContentLink is for download, webViewLink is for viewing.
      // For streaming subtitles, we often need a direct raw link or proxy it.
      // For now returning webContentLink.
      return response.data.webContentLink;
    } catch (error) {
      console.error('Drive upload failed:', error);
      throw error;
    }
  },

  // Create Folder (Structure: AnimeCrew / Series / Season / Ep)
  createFolder: async (folderName, parentId) => {
      const auth = await driveService.getAuth();
      if (!auth) return 'mock-folder-id';

      const drive = google.drive({ version: 'v3', auth });
      const fileMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentId ? [parentId] : []
      };

      try {
          const file = await drive.files.create({
              requestBody: fileMetadata,
              fields: 'id',
          });
          return file.data.id;
      } catch (error) {
          console.error('Folder creation failed:', error);
          throw error;
      }
  }
};
