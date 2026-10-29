/**
 * confirmAction - confirmation dialog that works on web and native.
 *
 * React Native's Alert.alert is a silent no-op on web (react-native-web),
 * so destructive confirmations built on it appear completely dead.
 * On web this falls back to window.confirm; on native it uses Alert.alert.
 */
import { Alert, Platform } from 'react-native';

export function confirmAction({
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm = null,
} = {}) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
    let ok = false;
    try {
      ok = window.confirm(message ? `${title}\n\n${message}` : title);
    } catch (e) {
      ok = false;
    }
    if (ok && typeof onConfirm === 'function') onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
