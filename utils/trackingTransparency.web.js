/**
 * trackingTransparency.web.js - web stub.
 * expo-tracking-transparency has no web native module; on web there is no
 * tracking permission to request, so this resolves as denied.
 */
export const requestTrackingPermissionsAsync = async () => ({
  status: 'denied',
  granted: false,
});
