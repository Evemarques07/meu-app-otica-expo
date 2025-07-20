import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/colors';
import { spacing, borderRadius, typography, shadows } from '../../styles/layout';

interface LoadingModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  progress?: number; // 0-100
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  title = 'Processando',
  message = 'Aguarde um momento...',
  progress,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <Pressable style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.modal}>
            <LinearGradient
              colors={[colors.backgroundStart, colors.backgroundEnd]}
              style={styles.modalBackground}
            >
              {/* Indicador de loading */}
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                {progress !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.max(0, Math.min(100, progress))}%` }
                        ]} 
                      />
                    </View>
                    <Text style={[typography.caption, styles.progressText]}>
                      {Math.round(progress)}%
                    </Text>
                  </View>
                )}
              </View>

              {/* Conteúdo */}
              <View style={styles.content}>
                <Text style={[typography.h3, styles.title]}>{title}</Text>
                <Text style={[typography.bodySecondary, styles.message]}>
                  {message}
                </Text>
              </View>
            </LinearGradient>
          </View>
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
    width: '80%',
    maxWidth: 320,
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
  loadingContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: colors.textSecondary,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoadingModal;
