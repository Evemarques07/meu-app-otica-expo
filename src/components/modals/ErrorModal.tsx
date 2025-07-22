import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/colors';
import { spacing, borderRadius, typography, shadows } from '../../styles/layout';

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  onRetry?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title,
  message,
  buttonText = 'OK',
  onClose,
  onRetry,
}) => {
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
              {/* Ícone de erro */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.error, '#DC3545']}
                  style={styles.iconBackground}
                >
                  <Feather name="x" size={32} color={colors.white} />
                </LinearGradient>
              </View>

              {/* Conteúdo */}
              <View style={styles.content}>
                <Text style={[typography.h2, styles.title]}>{title}</Text>
                <Text style={[typography.bodySecondary, styles.message]}>
                  {message}
                </Text>
              </View>

              {/* Botões */}
              <View style={styles.buttonContainer}>
                {onRetry && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={onRetry}
                    activeOpacity={0.8}
                  >
                    <Text style={[typography.button, styles.secondaryButtonText]}>
                      Tentar Novamente
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.button}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.error, '#DC3545']}
                    style={styles.buttonGradient}
                  >
                    <Text style={[typography.button, styles.buttonText]}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  modalBackground: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
  },
});

export default ErrorModal;
