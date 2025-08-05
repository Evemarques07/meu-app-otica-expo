import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useThemedColors } from "../hooks/useThemedColors";

interface OrientationModalProps {
  visible: boolean;
  onClose: () => void;
}

const OrientationModal: React.FC<OrientationModalProps> = ({
  visible,
  onClose,
}) => {
  const colors = useThemedColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* **MUDANÇA: Estilo do overlay simplificado.** */}
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>🔄 Direções na Foto</Text>

          <Text style={styles.subtitle}>Quando você olha para a pessoa:</Text>

          <View style={styles.instructions}>
            <Text style={styles.instruction}>
              🔴 <Text style={{ fontWeight: "bold" }}>ESQUERDA</Text> da pessoa
              = Do lado do seu olho DIREITO
            </Text>
            <Text style={styles.instruction}>
              🔵 <Text style={{ fontWeight: "bold" }}>DIREITA</Text> da pessoa =
              Do lado do seu olho ESQUERDO
            </Text>
          </View>

          <Text style={styles.note}>💡 É como um espelho</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Entendi!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// **MUDANÇA: Estilos atualizados para melhor funcionamento do Modal**
const styles = StyleSheet.create({
  overlay: {
    flex: 1, // Garante que o overlay ocupe toda a tela
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fundo escurecido
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 30,
    width: "90%",
    maxWidth: 320, // Aumentado um pouco para melhor legibilidade
    alignItems: "center",
    // Adicionando sombras para um visual mais elevado
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22, // Ligeiramente ajustado
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16, // Ligeiramente ajustado
    marginBottom: 20,
    textAlign: "center",
    color: "#555", // Cor suavizada
  },
  instructions: {
    marginBottom: 20,
    width: "100%",
  },
  instruction: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
    lineHeight: 24, // Melhorando o espaçamento
  },
  note: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 25, // Maior espaçamento
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14, // Ajuste no padding
    paddingHorizontal: 30,
    borderRadius: 25, // Bordas mais arredondadas
    minWidth: 140, // Largura mínima
  },
  buttonText: {
    fontSize: 16, // Tamanho de fonte ajustado
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});

export default OrientationModal;
