import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type PickResult = { uri: string } | null;

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return requested.granted;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestCameraPermissionsAsync();
  return requested.granted;
}

export async function pickFromLibrary(): Promise<PickResult> {
  const ok = await ensureLibraryPermission();
  if (!ok) {
    Alert.alert('Permission needed', 'Allow photo library access to choose images.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: true,
    aspect: [3, 4],
  });
  if (result.canceled || !result.assets[0]) return null;
  return { uri: result.assets[0].uri };
}

export async function captureWithCamera(): Promise<PickResult> {
  const ok = await ensureCameraPermission();
  if (!ok) {
    Alert.alert('Permission needed', 'Allow camera access to take photos.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: true,
    aspect: [3, 4],
  });
  if (result.canceled || !result.assets[0]) return null;
  return { uri: result.assets[0].uri };
}

export function promptImageSource(
  onPicked: (uri: string) => void | Promise<void>
): void {
  Alert.alert('Add photo', 'Choose a source', [
    {
      text: 'Camera',
      onPress: async () => {
        const result = await captureWithCamera();
        if (result) await onPicked(result.uri);
      },
    },
    {
      text: 'Photo library',
      onPress: async () => {
        const result = await pickFromLibrary();
        if (result) await onPicked(result.uri);
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
