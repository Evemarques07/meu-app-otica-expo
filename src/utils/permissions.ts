import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

/**
 * Verifica e solicita permissão para usar a câmera
 */
export const ensureCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Este app precisa de acesso à câmera para capturar fotos para medição.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar permissão da câmera:', error);
    Alert.alert(
      'Erro',
      'Não foi possível verificar a permissão da câmera.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

/**
 * Verifica e solicita permissão para acessar a galeria de fotos
 */
export const ensureGalleryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Este app precisa de acesso à galeria para selecionar fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar permissão da galeria:', error);
    Alert.alert(
      'Erro',
      'Não foi possível verificar a permissão da galeria.',
      [{ text: 'OK' }]
    );
    return false;
  }
};
