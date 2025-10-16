import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
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

  describe('getFirebaseConfig', () => {
    it('returns Firebase config', () => {
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
  });

  describe('getFirebaseAdminConfig', () => {
    it('returns Firebase admin config', () => {
      process.env.FIREBASE_PROJECT_ID = 'prod-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'prod@prod.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nPROD\\n-----END PRIVATE KEY-----\\n';

      const config = getFirebaseAdminConfig();

      expect(config.projectId).toBe('prod-project');
      expect(config.clientEmail).toBe('prod@prod.iam.gserviceaccount.com');
      expect(config.privateKey).toBe('-----BEGIN PRIVATE KEY-----\nPROD\n-----END PRIVATE KEY-----\n');
    });

    it('properly replaces escaped newlines in private key', () => {
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
        /Missing required Firebase configuration: authDomain, storageBucket/
      );
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
        /Missing required Firebase Admin configuration: projectId, clientEmail, privateKey/
      );
    });
  });
});
