import { google } from 'googleapis';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import User from '../models/User.js';
import Application from '../models/Application.js';

// --- Google OAuth ---

const getGoogleOAuthClient = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// GET /api/email/auth/google
export const initiateGoogleAuth = (req, res) => {
    const oauth2Client = getGoogleOAuthClient();
    const scopes = ['https://www.googleapis.com/auth/gmail.send'];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: req.userId,
    });

    res.json({ authUrl });
};

// GET /api/email/auth/google/callback
export const handleGoogleCallback = async (req, res) => {
    try {
        const { code, state: userId } = req.query;
        const oauth2Client = getGoogleOAuthClient();

        const { tokens } = await oauth2Client.getToken(code);

        await User.findByIdAndUpdate(userId, {
            emailProvider: 'gmail',
            oauthTokens: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(tokens.expiry_date),
            },
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailConnected=true`);
    } catch (error) {
        console.error("Google OAuth callback error:", error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailError=true`);
    }
};

// --- Microsoft OAuth ---

const getMsalClient = () => {
    return new ConfidentialClientApplication({
        auth: {
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            authority: 'https://login.microsoftonline.com/common',
        },
    });
};

// GET /api/email/auth/outlook
export const initiateOutlookAuth = async (req, res) => {
    const msalClient = getMsalClient();

    const authUrl = await msalClient.getAuthCodeUrl({
        scopes: ['Mail.Send'],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI,
        state: req.userId,
    });

    res.json({ authUrl });
};

// GET /api/email/auth/outlook/callback
export const handleOutlookCallback = async (req, res) => {
    try {
        const { code, state: userId } = req.query;
        const msalClient = getMsalClient();

        const tokenResponse = await msalClient.acquireTokenByCode({
            code,
            scopes: ['Mail.Send'],
            redirectUri: process.env.MICROSOFT_REDIRECT_URI,
        });

        await User.findByIdAndUpdate(userId, {
            emailProvider: 'outlook',
            oauthTokens: {
                accessToken: tokenResponse.accessToken,
                refreshToken: '',
                expiresAt: tokenResponse.expiresOn,
            },
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailConnected=true`);
    } catch (error) {
        console.error("Outlook OAuth callback error:", error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailError=true`);
    }
};

// --- Email Status & Disconnect ---

// GET /api/email/status
export const getEmailStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('emailProvider oauthTokens');
        res.json({
            connected: user.emailProvider !== 'none' && !!user.oauthTokens?.accessToken,
            provider: user.emailProvider,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get email status" });
    }
};

// DELETE /api/email/disconnect
export const disconnectEmail = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            emailProvider: 'none',
            oauthTokens: { accessToken: '', refreshToken: '', expiresAt: null },
        });
        res.json({ message: "Email disconnected" });
    } catch (error) {
        res.status(500).json({ message: "Failed to disconnect email" });
    }
};

// --- Send Email ---

const buildMimeMessage = (to, from, subject, body, pdfBuffer, pdfFilename) => {
    const boundary = 'boundary_' + Date.now();
    const mimeMessage = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        body,
        '',
        `--${boundary}`,
        `Content-Type: application/pdf; name="${pdfFilename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${pdfFilename}"`,
        '',
        pdfBuffer.toString('base64'),
        '',
        `--${boundary}--`,
    ].join('\r\n');

    return Buffer.from(mimeMessage).toString('base64url');
};

// POST /api/email/send/:id
export const sendApplicationEmail = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const application = await Application.findOne({ _id: id, userId });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (!application.recipientEmail) {
            return res.status(400).json({ message: "Recipient email is required" });
        }

        const user = await User.findById(userId);
        if (!user.oauthTokens?.accessToken) {
            return res.status(400).json({ message: "Please connect your email first" });
        }

        const { pdfBase64 } = req.body;
        if (!pdfBase64) {
            return res.status(400).json({ message: "Resume PDF is required" });
        }

        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const pdfFilename = `${application.emailSubject.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;

        if (user.emailProvider === 'gmail') {
            const oauth2Client = getGoogleOAuthClient();
            oauth2Client.setCredentials({
                access_token: user.oauthTokens.accessToken,
                refresh_token: user.oauthTokens.refreshToken,
            });

            if (new Date() >= new Date(user.oauthTokens.expiresAt)) {
                const { credentials } = await oauth2Client.refreshAccessToken();
                await User.findByIdAndUpdate(userId, {
                    'oauthTokens.accessToken': credentials.access_token,
                    'oauthTokens.expiresAt': new Date(credentials.expiry_date),
                });
                oauth2Client.setCredentials(credentials);
            }

            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            const rawMessage = buildMimeMessage(
                application.recipientEmail,
                user.email,
                application.emailSubject,
                application.emailBody,
                pdfBuffer,
                pdfFilename
            );

            await gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw: rawMessage },
            });

        } else if (user.emailProvider === 'outlook') {
            const client = Client.init({
                authProvider: (done) => {
                    done(null, user.oauthTokens.accessToken);
                },
            });

            await client.api('/me/sendMail').post({
                message: {
                    subject: application.emailSubject,
                    body: { contentType: 'Text', content: application.emailBody },
                    toRecipients: [{ emailAddress: { address: application.recipientEmail } }],
                    attachments: [{
                        '@odata.type': '#microsoft.graph.fileAttachment',
                        name: pdfFilename,
                        contentType: 'application/pdf',
                        contentBytes: pdfBase64,
                    }],
                },
            });
        } else {
            return res.status(400).json({ message: "No email provider connected" });
        }

        application.status = 'sent';
        application.sentAt = new Date();
        await application.save();

        res.json({ message: "Application sent successfully!", application });
    } catch (error) {
        console.error("Error sending email:", error);

        try {
            await Application.findByIdAndUpdate(req.params.id, { status: 'failed' });
        } catch {}

        res.status(500).json({ message: "Failed to send email. Please check your email connection." });
    }
};
