import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemedColors } from "../../hooks/useThemedColors";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../styles/layout";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  onAction?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  message,
  buttonText = "OK",
  onClose,
  onAction,
}) => {
  const colors = useThemedColors();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  // Estilos dinâmicos baseados no tema
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "90%",
      maxWidth: 400,
    },
    modal: {
      borderRadius: borderRadius.xl,
      overflow: "hidden",
      ...shadows.large,
    },
    modalBackground: {
      padding: spacing.xl,
      alignItems: "center",
    },
    iconContainer: {
      marginBottom: spacing.lg,
    },
    iconBackground: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      ...shadows.medium,
    },
    content: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    title: {
      textAlign: "center",
      marginBottom: spacing.md,
      color: colors.text,
    },
    message: {
      textAlign: "center",
      lineHeight: 24,
      color: colors.textMuted,
    },
    buttonContainer: {
      width: "100%",
    },
    button: {
      borderRadius: borderRadius.md,
      overflow: "hidden",
    },
    buttonGradient: {
      paddingVertical: spacing.md + 2,
      paddingHorizontal: spacing.xl,
      alignItems: "center",
    },
    buttonText: {
      color: colors.text,
    },
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={[colors.background, colors.surface]}
              style={styles.modalBackground}
            >
              {/* Ícone de sucesso */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.success, "#28A745"]}
                  style={styles.iconBackground}
                >
                  <Feather name="check" size={32} color={colors.white} />
                </LinearGradient>
              </View>

              {/* Conteúdo */}
              <View style={styles.content}>
                <Text
                  style={[typography.h2, styles.title]}
                  allowFontScaling={false}
                >
                  {title}
                </Text>
                <Text
                  style={[typography.bodySecondary, styles.message]}
                  allowFontScaling={false}
                >
                  {message}
                </Text>
              </View>

              {/* Botões */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAction}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.success, "#28A745"]}
                    style={styles.buttonGradient}
                  >
                    <Text
                      style={[typography.button, styles.buttonText]}
                      allowFontScaling={false}
                    >
                      {buttonText}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default SuccessModal;
