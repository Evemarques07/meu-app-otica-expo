import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  StatusBar,
  Animated,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ensureCameraPermission,
  ensureGalleryPermission,
} from "../utils/permissions";
import { ImageData } from "../types";
import { useThemedColors } from '../hooks/useThemedColors';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { spacing, borderRadius, typography, shadows, containers } from '../styles/layout';

interface CaptureScreenProps {
  onImageCaptured: (imageData: ImageData) => void;
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({ onImageCaptured }) => {
  const colors = useThemedColors();
  
  // Estilos dinâmicos baseados no tema
  const styles = StyleSheet.create({
    header: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: spacing.md,
    },
    logoContainer: {
      alignItems: 'center',
    },
    logo: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    title: {
      ...typography.title,
      marginBottom: spacing.md,
      color: colors.text,
    },
    subtitle: {
      ...typography.subtitle,
      textAlign: "center",
      color: colors.textMuted,
    },
    card: {
      ...containers.card,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      marginBottom: spacing.xl,
      backgroundColor: colors.surface,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 58, // Alinhado com o texto
    },
    instruction: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    instructionIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    instructionTextContainer: {
      flex: 1,
    },
    instructionTitle: {
      ...typography.label,
      fontSize: 16,
      marginBottom: 4,
      color: colors.text,
    },
    instructionText: {
      ...typography.bodySecondary,
      lineHeight: 22,
      color: colors.textMuted,
    },
    buttonsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg + 2,
      borderRadius: borderRadius.md,
      gap: spacing.md,
      ...shadows.medium,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    buttonPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
    buttonText: {
      ...typography.button,
      color: colors.text,
    },
    secondaryButtonText: {
      color: colors.primary,
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryMuted,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary
    },
    tipText: {
      ...typography.bodySecondary,
      lineHeight: 21,
      flex: 1,
      color: colors.text,
    },
  });

  // Componente reutilizável para cada linha de instrução
  const InstructionItem = ({ icon, title, text }: { icon: any; title: string; text: string }) => (
    <>
      <View style={styles.instruction}>
        <View style={styles.instructionIconContainer}>
          <Feather name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.instructionTextContainer}>
          <Text style={styles.instructionTitle}>{title}</Text>
          <Text style={styles.instructionText}>{text}</Text>
        </View>
      </View>
      <View style={styles.divider} />
    </>
  );
  
  // Animação de fade-in para o conteúdo
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleTakePhoto = async () => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]) {
        const { uri, width, height } = result.assets[0];
        onImageCaptured({ uri, width, height });
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
        quality: 0.9,
      });
      
      if (!result.canceled && result.assets?.[0]) {
        const { uri, width, height } = result.assets[0];
        onImageCaptured({ uri, width, height });
      }
    } catch (error) {
      console.error("Erro ao selecionar foto:", error);
      Alert.alert("Erro", "Não foi possível selecionar a foto.");
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={containers.screen}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={containers.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/logoappotica.jpg")}
                  style={styles.logo}
                />
              </View>
              <ThemeSwitch />
            </View>
            <Text style={styles.title}>Medição Inteligente</Text>
            <Text style={styles.subtitle}>
              Siga os passos abaixo para uma medição precisa da sua DNP.
            </Text>
          </View>

          <View style={styles.card}>
            <InstructionItem 
              icon="camera"
              title="Posicionamento"
              text="Fique de frente para a câmera e olhe diretamente para a lente."
            />
            <InstructionItem 
              icon="credit-card"
              title="Objeto de Referência"
              text="Segure um cartão padrão (crédito/débito) contra a testa."
            />
            <InstructionItem 
              icon="sun"
              title="Iluminação Ideal"
              text="Escolha um ambiente bem iluminado, evitando sombras no rosto."
            />
            <InstructionItem 
              icon="zoom-in"
              title="Enquadramento"
              text="Garanta que seu rosto e o cartão estejam nítidos e visíveis."
            />
          </View>
          
          <View style={styles.buttonsContainer}>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleTakePhoto}>
              <Feather name="camera" size={20} color={colors.text} />
              <Text style={styles.buttonText}>Tirar Foto Agora</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.buttonPressed]} onPress={handleSelectFromGallery}>
              <Feather name="image" size={20} color={colors.primary} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Usar Foto da Galeria
              </Text>
            </Pressable>
          </View>

          <View style={styles.tipContainer}>
            <Feather name="info" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              <Text style={{fontWeight: 'bold'}}>Dica:</Text> Fotos com a câmera traseira geralmente possuem maior qualidade e precisão.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default CaptureScreen;