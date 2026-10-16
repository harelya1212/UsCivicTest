/**
 * trackingTransparency.js - native (iOS/Android) implementation.
 * Re-exports expo-tracking-transparency (App Tracking Transparency is iOS-only;
 * on Android the request is a no-op). Web uses trackingTransparency.web.js.
 */
export { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
