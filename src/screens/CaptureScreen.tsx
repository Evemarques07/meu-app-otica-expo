import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  ensureCameraPermission,
  ensureGalleryPermission,
} from "../utils/permissions";
import { ImageData } from "../types";

interface CaptureScreenProps {
  onImageCaptured: (imageData: ImageData) => void;
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({ onImageCaptured }) => {
  const handleTakePhoto = async () => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri && asset.width && asset.height) {
          const imageData: ImageData = {
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          };
          onImageCaptured(imageData);
        }
      }
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      Alert.alert("Erro", "Não foi possível capturar a foto.");
    }
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await ensureGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri && asset.width && asset.height) {
          const imageData: ImageData = {
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          };
          onImageCaptured(imageData);
        }
      }
    } catch (error) {
      console.error("Erro ao selecionar foto:", error);
      Alert.alert("Erro", "Não foi possível selecionar a foto.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/logoappotica.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Medição de Óculos</Text>
        <Text style={styles.subtitle}>
          Para começar a medição, capture uma foto ou selecione da galeria
        </Text>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📋 Instruções Importantes:</Text>

        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>1.</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>Posição da pessoa:</Text> De frente para a
            câmera, olhando diretamente para a lente
          </Text>
        </View>

        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>2.</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>Cartão de referência:</Text> Posicione um
            cartão de crédito próximo ao rosto da pessoa
          </Text>
        </View>

        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>3.</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>Iluminação:</Text> Certifique-se de ter
            boa iluminação e que a foto esteja nítida
          </Text>
        </View>

        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>4.</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>Distância:</Text> Mantenha uma distância
            adequada para que o rosto e o cartão sejam visíveis
          </Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>📷 Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSelectFromGallery}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            🖼️ Selecionar da Galeria
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          💡 <Text style={styles.bold}>Dica:</Text> Para melhores resultados,
          use a câmera traseira e mantenha o dispositivo estável
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  instructionsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  instruction: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 10,
    minWidth: 20,
  },
  instructionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "bold",
  },
  buttonsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
  tipContainer: {
    backgroundColor: "#E8F4FD",
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  tipText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default CaptureScreen;
