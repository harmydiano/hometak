require('dotenv').config();
const PORT = process.env.PORT || 3010;
module.exports = {
    app: {
        appName: process.env.APP_NAME || 'App Name',
        environment: process.env.NODE_ENV || 'dev',
        superSecret: process.env.SERVER_SECRET || 'ipa-BUhBOJAm',
        baseUrl: `http://localhost:${PORT}`,
        siteUrl: `http://127.0.0.1:${PORT}/api/v1/`,
        port: PORT,
        domain: process.env.APP_DOMAIN || 'app.com',
        email_encryption: process.env.EMAIL_ENCRYPTION || false,
        verify_redirect_url: `${process.env.BASE_URL}/verify`,
    },
    auth: {
        email_encryption: false,
        encryption_key: process.env.SERVER_SECRET || 'appSecret',
        expiresIn: 3600 * 124 * 100,
    },
    api: {
        lang: 'en',
        prefix: '^/api/v[1-9]',
        resource: '^/resources/[a-zA-Z-]+',
        action: '^/actions/[a-zA-Z-]+',
        dashboard: '^/dashboard/[a-zA-Z-]+',
        versions: [1],
        patch_version: '1.0.0',
        pagination: {
            itemsPerPage: 100
        }
    },
    email: {
        from: 'HomeTak <hamid@roombus.com>',
        service: "gmail",
        authType: "OAuth2"
    },
    memberRoles: ['Administrator', 'member'],
    services: {
        main: process.env.APP_SERVICE || 'http://localhost:3000/api/v1',
        vendor: process.env.VENDOR_SERVICE || 'http://localhost:8000/api/v1',
        event: process.env.EVENT_SERVICE || 'http://localhost:8001/api/v1'
    },
    databases: {
        mongodb: {
            url: process.env.DB_URL,
            test: process.env.DB_TEST_URL,
        }
    },
    social: {
        facebook: {
            callbackURL: 'https://3f9455a6f43d.ngrok.io/api/v1/facebook/callback',
            authorizationURL: 'https://www.facebook.com/dialog/oauth',
            tokenURL: 'https://graph.facebook.com/oauth/access_token',
            // GraphUrl: 'https://graph.facebook.com/v2.11/me?fields=id,name,email',
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_SECRET,
            profileFields: ['id', 'displayName', 'name', 'emails']
        },
        google: {
            url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
            authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
            tokenURL: 'https://accounts.google.com/o/oauth2/token',
            callbackURL: 'https://81673c832aea.ngrok.io/api/v1/google/callback',
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH,
            playground: process.env.GOOGLE_PLAYGROUND,
            redirect_uris: process.env.GOOGLE_REDIRECT_URI,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        },
    },
    email: {
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY,
            from: process.env.EMAIL_NO_REPLY,
            contactFormRecipient: process.env.CONTACT_FORM_EMAIL_RECIPIENT,
        },
        nodemailer: {
            from: 'harmylarry20',
            service: "gmail",
            authType: "OAuth2"
        }
    },
    google: {
        url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
        authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
        tokenURL: 'https://accounts.google.com/o/oauth2/token',
        callbackURL: 'https://81673c832aea.ngrok.io/api/v1/google/callback',
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH,
        playground: process.env.GOOGLE_PLAYGROUND,
        redirect_uris: process.env.GOOGLE_REDIRECT_URI,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    },
    emailAlerts: {
        templateIds: {
            verify: process.env.VERIFY_CODE,
            reset: process.env.RESET_PASSWORD,
            invite: process.env.INVITAION,
        },
    },
    excludedUrls: [
        { route: '', method: 'GET' },
        { route: 'login', method: 'POST' },
        { route: 'register', method: 'POST' },
    ],
    // google: {
	// 	email : "harmylarry20@gmail.com",
	// 	clientId : "1358945318-r8u1g6h1ufouf27iofs6prrvrc7q3taf.apps.googleusercontent.com",
	// 	secretKey : "-TuJGE-qU86foZaGyHKQ4eRC",
	// 	refreshToken : "1//04-UL1PHcq1ZgCgYIARAAGAQSNwF-L9Ir0HwwYT4Xw6JNJ-4OaVT12Qx8e6smMYXTSQZWZnpIOOFsFy78zD1Z0REIj2jKXMBSs3E"
	// },
    aws: {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: process.env.AWS_REGION,
            params: { Bucket: 'vwcompany' },
        },
        bucket: process.env.AWS_BUCKET,
        s3Link: `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/`,
    },
    paystack: {
        url: process.env.PAYSTACK_BASE_URL,
        secret: process.env.PAYSTACK_SECRET
    },
    stripe: {
        secret: process.env.STRIPE_SECRET
    },
    flutterwave: {
        encryption: process.env.FLUTTER_ENCRYPTION,
        public: process.env.FLUTTER_PUBLIC,
        secret: process.env.FLUTTER_SECRET
    },
    options: {
        errors: {
            wrap: { label: '' }
        }
    }
};