import axios from 'axios';

const { SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_SITE_URL } = process.env;

const isConfigured = () =>
  !!(SHAREPOINT_TENANT_ID && SHAREPOINT_CLIENT_ID && SHAREPOINT_CLIENT_SECRET && SHAREPOINT_SITE_URL);

let cachedToken: { token: string; expiresAt: number } | null = null;

export const getAccessToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;
  const res = await axios.post(
    `https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SHAREPOINT_CLIENT_ID!,
      client_secret: SHAREPOINT_CLIENT_SECRET!,
      scope: `${SHAREPOINT_SITE_URL}/.default`,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  cachedToken = {
    token: res.data.access_token,
    expiresAt: Date.now() + (res.data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
};

export const browseLibrary = async (libraryName: string = 'Documents', _folderPath = '') => {
  if (!isConfigured()) return { configured: false, files: [] };
  try {
    const token = await getAccessToken();
    const url = `${SHAREPOINT_SITE_URL}/_api/web/lists/getbytitle('${encodeURIComponent(libraryName)}')/items?$select=Title,FileRef,FileLeafRef,File_x0020_Size,Modified&$top=100`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json;odata=verbose' },
    });
    return { configured: true, files: res.data.d.results };
  } catch {
    return { configured: true, files: [], error: 'Failed to browse SharePoint library' };
  }
};
