import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isDemoMode,
  getFirebaseConfig,
  getFirebaseAdminConfig,
  validateFirebaseConfig,
  validateFirebaseAdminConfig,
} from './demo';

describe('demo config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  describe('isDemoMode', () => {
    it('returns true when NEXT_PUBLIC_DEMO_MODE is "true"', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      expect(isDemoMode()).toBe(true);
    });

    it('returns false when NEXT_PUBLIC_DEMO_MODE is "false"', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      expect(isDemoMode()).toBe(false);
    });

    it('returns false when NEXT_PUBLIC_DEMO_MODE is undefined', () => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
      expect(isDemoMode()).toBe(false);
    });

    it('returns false when NEXT_PUBLIC_DEMO_MODE is any other value', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'yes';
      expect(isDemoMode()).toBe(false);
    });
  });

  describe('getFirebaseConfig', () => {
    it('returns demo Firebase config when in demo mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      process.env.NEXT_PUBLIC_FIREBASE_DEMO_PROJECT_ID = 'demo-project';
      process.env.NEXT_PUBLIC_FIREBASE_DEMO_API_KEY = 'demo-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_DEMO_AUTH_DOMAIN = 'demo.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_DEMO_STORAGE_BUCKET = 'demo.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_DEMO_MESSAGING_SENDER_ID = 'demo-sender';
      process.env.NEXT_PUBLIC_FIREBASE_DEMO_APP_ID = 'demo-app-id';

      const config = getFirebaseConfig();

      expect(config.projectId).toBe('demo-project');
      expect(config.apiKey).toBe('demo-api-key');
      expect(config.authDomain).toBe('demo.firebaseapp.com');
      expect(config.storageBucket).toBe('demo.appspot.com');
      expect(config.messagingSenderId).toBe('demo-sender');
      expect(config.appId).toBe('demo-app-id');
    });

    it('returns production Firebase config when not in demo mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'prod-project';
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'prod-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'prod.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'prod.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'prod-sender';
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'prod-app-id';

      const config = getFirebaseConfig();

      expect(config.projectId).toBe('prod-project');
      expect(config.apiKey).toBe('prod-api-key');
      expect(config.authDomain).toBe('prod.firebaseapp.com');
      expect(config.storageBucket).toBe('prod.appspot.com');
      expect(config.messagingSenderId).toBe('prod-sender');
      expect(config.appId).toBe('prod-app-id');
    });

    it('returns production config when NEXT_PUBLIC_DEMO_MODE is undefined', () => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'prod-project';

      const config = getFirebaseConfig();

      expect(config.projectId).toBe('prod-project');
    });
  });

  describe('getFirebaseAdminConfig', () => {
    it('returns demo admin config when in demo mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      process.env.FIREBASE_DEMO_PROJECT_ID = 'demo-project';
      process.env.FIREBASE_DEMO_CLIENT_EMAIL = 'demo@demo.iam.gserviceaccount.com';
      process.env.FIREBASE_DEMO_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nDEMO\\n-----END PRIVATE KEY-----\\n';

      const config = getFirebaseAdminConfig();

      expect(config.projectId).toBe('demo-project');
      expect(config.clientEmail).toBe('demo@demo.iam.gserviceaccount.com');
      expect(config.privateKey).toBe('-----BEGIN PRIVATE KEY-----\nDEMO\n-----END PRIVATE KEY-----\n');
    });

    it('returns production admin config when not in demo mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      process.env.FIREBASE_PROJECT_ID = 'prod-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'prod@prod.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nPROD\\n-----END PRIVATE KEY-----\\n';

      const config = getFirebaseAdminConfig();

      expect(config.projectId).toBe('prod-project');
      expect(config.clientEmail).toBe('prod@prod.iam.gserviceaccount.com');
      expect(config.privateKey).toBe('-----BEGIN PRIVATE KEY-----\nPROD\n-----END PRIVATE KEY-----\n');
    });

    it('properly replaces escaped newlines in private key', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      process.env.FIREBASE_PRIVATE_KEY = 'line1\\nline2\\nline3';

      const config = getFirebaseAdminConfig();

      expect(config.privateKey).toBe('line1\nline2\nline3');
    });
  });

  describe('validateFirebaseConfig', () => {
    it('does not throw when all required fields are present', () => {
      const config = {
        apiKey: 'test-key',
        authDomain: 'test.firebaseapp.com',
        projectId: 'test-project',
        storageBucket: 'test.appspot.com',
        messagingSenderId: 'test-sender',
        appId: 'test-app-id',
      };

      expect(() => validateFirebaseConfig(config)).not.toThrow();
    });

    it('throws error when required fields are missing', () => {
      const config = {
        apiKey: 'test-key',
        authDomain: undefined,
        projectId: 'test-project',
        storageBucket: undefined,
        messagingSenderId: 'test-sender',
        appId: 'test-app-id',
      };

      expect(() => validateFirebaseConfig(config)).toThrow(
        /Missing required Firebase .* configuration: authDomain, storageBucket/
      );
    });

    it('includes mode in error message when in demo mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      const config = {
        apiKey: undefined,
        authDomain: 'test.firebaseapp.com',
        projectId: 'test-project',
        storageBucket: 'test.appspot.com',
        messagingSenderId: 'test-sender',
        appId: 'test-app-id',
      };

      expect(() => validateFirebaseConfig(config)).toThrow(/demo configuration/);
    });

    it('includes mode in error message when in production mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      const config = {
        apiKey: undefined,
        authDomain: 'test.firebaseapp.com',
        projectId: 'test-project',
        storageBucket: 'test.appspot.com',
        messagingSenderId: 'test-sender',
        appId: 'test-app-id',
      };

      expect(() => validateFirebaseConfig(config)).toThrow(/production configuration/);
    });
  });

  describe('validateFirebaseAdminConfig', () => {
    it('does not throw when all required fields are present', () => {
      const config = {
        projectId: 'test-project',
        clientEmail: 'test@test.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n',
      };

      expect(() => validateFirebaseAdminConfig(config)).not.toThrow();
    });

    it('throws error when projectId is missing', () => {
      const config = {
        projectId: undefined,
        clientEmail: 'test@test.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n',
      };

      expect(() => validateFirebaseAdminConfig(config)).toThrow(
        /Missing required Firebase Admin .* configuration: projectId/
      );
    });

    it('throws error when clientEmail is missing', () => {
      const config = {
        projectId: 'test-project',
        clientEmail: undefined,
        privateKey: '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n',
      };

      expect(() => validateFirebaseAdminConfig(config)).toThrow(
        /Missing required Firebase Admin .* configuration: clientEmail/
      );
    });

    it('throws error when privateKey is missing', () => {
      const config = {
        projectId: 'test-project',
        clientEmail: 'test@test.iam.gserviceaccount.com',
        privateKey: undefined,
      };

      expect(() => validateFirebaseAdminConfig(config)).toThrow(
        /Missing required Firebase Admin .* configuration: privateKey/
      );
    });

    it('throws error with all missing fields listed', () => {
      const config = {
        projectId: undefined,
        clientEmail: undefined,
        privateKey: undefined,
      };

      expect(() => validateFirebaseAdminConfig(config)).toThrow(
        /Missing required Firebase Admin .* configuration: projectId, clientEmail, privateKey/
      );
    });

    it('includes mode in error message when in demo mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      const config = {
        projectId: undefined,
        clientEmail: 'test@test.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n',
      };

      expect(() => validateFirebaseAdminConfig(config)).toThrow(/demo configuration/);
    });

    it('includes mode in error message when in production mode', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      const config = {
        projectId: undefined,
        clientEmail: 'test@test.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n',
      };

      expect(() => validateFirebaseAdminConfig(config)).toThrow(/production configuration/);
    });
  });
});
