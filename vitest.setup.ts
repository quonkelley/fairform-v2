import "@testing-library/jest-dom";

process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??= "test-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??= "test-auth";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??= "test-project";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??= "test-bucket";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??= "test-sender";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??= "test-app";

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
