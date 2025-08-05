import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import {
  MeasurementResults,
  ImageData,
  CalibrationData,
  MeasurementPoint,
} from "../types";
import { shareResultsPDF, shareResultsText } from "../utils/sharing";
import { useThemedColors } from "../hooks/useThemedColors";
import { ThemeSwitch } from "../components/ThemeSwitch";
import { spacing, typography } from "../styles/layout";

interface ResultsScreenProps {
  results: MeasurementResults;
  imageData?: ImageData;
  calibrationData?: CalibrationData;
  measurementPoints?: MeasurementPoint[];
  capturedImageUri?: string | null;
  onStartNew: () => void;
  onBack: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  results,
  imageData,
  calibrationData,
  measurementPoints,
  capturedImageUri,
  onStartNew,
  onBack,
}) => {
  const colors = useThemedColors();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [shareType, setShareType] = useState<"pdf" | "text">("pdf");

  const handleSharePDF = async () => {
    setShareType("pdf");
    setShowNameModal(true);
  };

  const handleShareText = async () => {
    setShareType("text");
    setShowNameModal(true);
  };

  const handleConfirmShare = async () => {
    setShowNameModal(false);

    if (shareType === "pdf") {
      setIsGeneratingPDF(true);
      try {
        await shareResultsPDF(
          results,
          imageData,
          calibrationData,
          measurementPoints,
          patientName.trim(),
          capturedImageUri || undefined
        );
      } catch (error) {
        console.error("Erro ao compartilhar PDF:", error);
      } finally {
        setIsGeneratingPDF(false);
      }
    } else {
      setIsGeneratingText(true);
      try {
        await shareResultsText(results, patientName.trim());
      } catch (error) {
        console.error("Erro ao compartilhar texto:", error);
      } finally {
        setIsGeneratingText(false);
      }
    }
    setPatientName("");
  };

  const getMeasurementCard = (
    title: string,
    value: number,
    unit: string,
    description: string,
    icon: string
  ) => (
    <View style={[styles.measurementCard, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon} allowFontScaling={false}>
          {icon}
        </Text>
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          allowFontScaling={false}
        >
          {title}
        </Text>
      </View>
      <Text
        style={[styles.cardValue, { color: colors.primary }]}
        allowFontScaling={false}
      >
        {value}{" "}
        <Text
          style={[styles.cardUnit, { color: colors.textSecondary }]}
          allowFontScaling={false}
        >
          {unit}
        </Text>
      </Text>
      <Text
        style={[styles.cardDescription, { color: colors.textSecondary }]}
        allowFontScaling={false}
      >
        {description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text
            style={[styles.title, { color: colors.white }]}
            allowFontScaling={false}
          >
            Resultados
          </Text>
          <View style={styles.shareButtons}>
            <ThemeSwitch size={20} />
            <TouchableOpacity
              style={[styles.shareButton, styles.textShareButton]}
              onPress={handleShareText}
              disabled={isGeneratingText}
            >
              {isGeneratingText ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Feather
                    name="message-circle"
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.shareButtonText, { color: colors.primary }]}
                    allowFontScaling={false}
                  >
                    Texto
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareButton, styles.pdfShareButton]}
              onPress={handleSharePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <>
                  <Feather name="file-text" size={16} color={colors.surface} />
                  <Text
                    style={[
                      styles.pdfShareButtonText,
                      { color: colors.surface },
                    ]}
                    allowFontScaling={false}
                  >
                    PDF
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.successBanner,
            {
              backgroundColor: colors.surface,
              borderColor: colors.success,
            },
          ]}
        >
          <View style={styles.successIconWrapper}>
            <Feather name="check-circle" size={64} color={colors.success} />
          </View>
          <Text
            style={[styles.successTitle, { color: colors.success }]}
            allowFontScaling={false}
          >
            Medições Concluídas!
          </Text>
          <Text
            style={[styles.successSubtitle, { color: colors.textSecondary }]}
            allowFontScaling={false}
          >
            Todas as medições foram calculadas com sucesso
          </Text>
        </View>

        <View style={styles.measurementsContainer}>
          <Text
            style={[styles.sectionTitle, { color: colors.text }]}
            allowFontScaling={false}
          >
            Medições Principais
          </Text>

          {getMeasurementCard(
            "DP - Distância Pupilar Total",
            results.dp,
            "mm",
            "Distância entre o centro das duas pupilas",
            "👁️"
          )}

          <View style={styles.dpnContainer}>
            <Text
              style={[styles.subsectionTitle, { color: colors.text }]}
              allowFontScaling={false}
            >
              DPN - Distância Pupilar Nasal
            </Text>
            <View style={styles.dpnRow}>
              {getMeasurementCard(
                "DPN Esquerda",
                results.dpnLeft,
                "mm",
                "Centro da ponte até pupila esquerda",
                "👁️"
              )}
              {getMeasurementCard(
                "DPN Direita",
                results.dpnRight,
                "mm",
                "Centro da ponte até pupila direita",
                "👁️"
              )}
            </View>
          </View>

          <View style={styles.heightContainer}>
            <Text
              style={[styles.subsectionTitle, { color: colors.text }]}
              allowFontScaling={false}
            >
              Altura Óptica
            </Text>
            <View style={styles.heightRow}>
              {getMeasurementCard(
                "Altura Esquerda",
                results.heightLeft,
                "mm",
                "Base da lente até centro da pupila",
                "📐"
              )}
              {getMeasurementCard(
                "Altura Direita",
                results.heightRight,
                "mm",
                "Base da lente até centro da pupila",
                "📐"
              )}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.infoContainer,
            {
              backgroundColor: colors.surface,
              borderLeftColor: colors.warning,
            },
          ]}
        >
          <Text
            style={[styles.infoTitle, { color: colors.warning }]}
            allowFontScaling={false}
          >
            ℹ️ Informações Importantes
          </Text>
          <View style={styles.infoItem}>
            <Text
              style={[styles.infoBullet, { color: colors.warning }]}
              allowFontScaling={false}
            >
              •
            </Text>
            <Text
              style={[styles.infoText, { color: colors.text }]}
              allowFontScaling={false}
            >
              Estas medições são essenciais para garantir o correto
              posicionamento das lentes
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text
              style={[styles.infoBullet, { color: colors.warning }]}
              allowFontScaling={false}
            >
              •
            </Text>
            <Text
              style={[styles.infoText, { color: colors.text }]}
              allowFontScaling={false}
            >
              A DP garante que as lentes fiquem centralizadas com suas pupilas
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text
              style={[styles.infoBullet, { color: colors.warning }]}
              allowFontScaling={false}
            >
              •
            </Text>
            <Text
              style={[styles.infoText, { color: colors.text }]}
              allowFontScaling={false}
            >
              A altura óptica assegura o conforto visual adequado
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text
              style={[styles.infoBullet, { color: colors.warning }]}
              allowFontScaling={false}
            >
              •
            </Text>
            <Text
              style={[styles.infoText, { color: colors.text }]}
              allowFontScaling={false}
            >
              Leve estas medições ao seu oftalmologista ou ótica de confiança
            </Text>
          </View>
        </View>

        <View style={styles.timestampContainer}>
          <Text
            style={[styles.timestamp, { color: colors.textSecondary }]}
            allowFontScaling={false}
          >
            Medição realizada em: {new Date().toLocaleString("pt-BR")}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.newMeasurementButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={onStartNew}
        >
          <Feather name="camera" size={20} color={colors.surface} />
          <Text
            style={[styles.newMeasurementButtonText, { color: colors.surface }]}
            allowFontScaling={false}
          >
            Nova Medição
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para inserir nome do paciente */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text
              style={[styles.modalTitle, { color: colors.text }]}
              allowFontScaling={false}
            >
              {shareType === "pdf"
                ? "📄 Compartilhar PDF"
                : "📱 Compartilhar Texto"}
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.textSecondary }]}
              allowFontScaling={false}
            >
              Insira o nome do paciente (opcional)
            </Text>

            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Nome do paciente"
              placeholderTextColor={colors.textSecondary}
              value={patientName}
              onChangeText={setPatientName}
              autoFocus={true}
              maxLength={50}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalCancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={() => setShowNameModal(false)}
              >
                <Text
                  style={[
                    styles.modalCancelText,
                    { color: colors.textSecondary },
                  ]}
                  allowFontScaling={false}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleConfirmShare}
              >
                <Text
                  style={[styles.modalConfirmText, { color: colors.white }]}
                  allowFontScaling={false}
                >
                  {shareType === "pdf" ? "Gerar PDF" : "Compartilhar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Será sobrescrito dinamicamente
  },
  headerGradient: {
    paddingBottom: spacing.md,
  },
  header: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    ...typography.h2,
    color: "#FFFFFF", // Será sobrescrito dinamicamente
  },
  shareButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 4,
    minWidth: 60,
    justifyContent: "center",
  },
  successIconWrapper: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  // shareButton: {
  //   backgroundColor: "#007AFF",
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   borderRadius: 6,
  //   minWidth: 70,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // shareButtons: {
  //   flexDirection: "row",
  //   gap: 8,
  // },

  textShareButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pdfShareButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pdfShareButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  successBanner: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
    borderWidth: 1,
  },
  logoSmall: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  measurementsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 20,
  },
  measurementCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardUnit: {
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 12,
  },
  dpnContainer: {
    marginTop: 20,
  },
  dpnRow: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  heightContainer: {
    marginTop: 20,
  },
  heightRow: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  infoBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  timestampContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timestamp: {
    fontSize: 12,
    fontStyle: "italic",
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "transparent",
  },
  newMeasurementButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newMeasurementButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos do modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    margin: 20,
    padding: 25,
    borderRadius: 15,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ResultsScreen;
