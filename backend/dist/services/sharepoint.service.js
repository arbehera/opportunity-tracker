"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.browseLibrary = exports.getAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const { SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_SITE_URL } = process.env;
const isConfigured = () => !!(SHAREPOINT_TENANT_ID && SHAREPOINT_CLIENT_ID && SHAREPOINT_CLIENT_SECRET && SHAREPOINT_SITE_URL);
let cachedToken = null;
const getAccessToken = async () => {
    if (cachedToken && Date.now() < cachedToken.expiresAt)
        return cachedToken.token;
    const res = await axios_1.default.post(`https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`, new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHAREPOINT_CLIENT_ID,
        client_secret: SHAREPOINT_CLIENT_SECRET,
        scope: `${SHAREPOINT_SITE_URL}/.default`,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    cachedToken = {
        token: res.data.access_token,
        expiresAt: Date.now() + (res.data.expires_in - 60) * 1000,
    };
    return cachedToken.token;
};
exports.getAccessToken = getAccessToken;
const browseLibrary = async (libraryName = 'Documents', _folderPath = '') => {
    if (!isConfigured())
        return { configured: false, files: [] };
    try {
        const token = await (0, exports.getAccessToken)();
        const url = `${SHAREPOINT_SITE_URL}/_api/web/lists/getbytitle('${encodeURIComponent(libraryName)}')/items?$select=Title,FileRef,FileLeafRef,File_x0020_Size,Modified&$top=100`;
        const res = await axios_1.default.get(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json;odata=verbose' },
        });
        return { configured: true, files: res.data.d.results };
    }
    catch {
        return { configured: true, files: [], error: 'Failed to browse SharePoint library' };
    }
};
exports.browseLibrary = browseLibrary;
