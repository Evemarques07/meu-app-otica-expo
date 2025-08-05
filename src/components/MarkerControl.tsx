import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useThemedColors } from "../hooks/useThemedColors";
import Joystick from "./Joystick";
import { MeasurementPoint, MeasurementType } from "../types";

interface MarkerControlProps {
  selectedMarker: MeasurementPoint | null;
  onMarkerMove: (
    marker: MeasurementPoint,
    deltaX: number,
    deltaY: number
  ) => void;
  onMarkerSelect: (marker: MeasurementPoint | null) => void;
  measurementPoints: MeasurementPoint[];
  visible: boolean;
}

const MarkerControl: React.FC<MarkerControlProps> = ({
  selectedMarker,
  onMarkerMove,
  onMarkerSelect,
  measurementPoints,
  visible,
}) => {
  const colors = useThemedColors();
  const [isMoving, setIsMoving] = useState(false);

  const handleJoystickMove = useCallback(
    (deltaX: number, deltaY: number, intensity: number) => {
      if (!selectedMarker) return;

      setIsMoving(intensity > 0);

      if (intensity > 0) {
        // Escalar o movimento baseado na intensidade
        const moveSpeed = 2; // pixels por frame
        const scaledDeltaX = deltaX * moveSpeed * intensity;
        const scaledDeltaY = deltaY * moveSpeed * intensity;

        onMarkerMove(selectedMarker, scaledDeltaX, scaledDeltaY);
      }
    },
    [selectedMarker, onMarkerMove]
  );

  const getMarkerLabel = (type: MeasurementType): string => {
    switch (type) {
      case MeasurementType.LEFT_PUPIL:
        return "Pupila Esquerda (da pessoa)";
      case MeasurementType.RIGHT_PUPIL:
        return "Pupila Direita (da pessoa)";
      case MeasurementType.BRIDGE_CENTER:
        return "Centro da Ponte Nasal";
      case MeasurementType.LEFT_LENS_BOTTOM:
        return "Base Lente Esquerda (da pessoa)";
      case MeasurementType.RIGHT_LENS_BOTTOM:
        return "Base Lente Direita (da pessoa)";
      case MeasurementType.CARD_LEFT:
        return "Cartão - Extremidade Esquerda";
      case MeasurementType.CARD_RIGHT:
        return "Cartão - Extremidade Direita";
      default:
        return "Marcador";
    }
  };

  const getMarkerColor = (type: MeasurementType): string => {
    switch (type) {
      case MeasurementType.LEFT_PUPIL:
        return "#ff4444";
      case MeasurementType.RIGHT_PUPIL:
        return "#4444ff";
      case MeasurementType.BRIDGE_CENTER:
        return "#FF6600";
      case MeasurementType.LEFT_LENS_BOTTOM:
        return "#9966CC";
      case MeasurementType.RIGHT_LENS_BOTTOM:
        return "#CC6699";
      case MeasurementType.CARD_LEFT:
        return "#ff4444";
      case MeasurementType.CARD_RIGHT:
        return "#4444ff";
      default:
        return "#666";
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}>
      <View style={styles.header}>
        <Text
          style={[styles.title, { color: colors.white }]}
          allowFontScaling={false}
        >
          Controle de Marcadores
        </Text>
      </View>

      {/* Lista de marcadores */}
      <View style={styles.markerList}>
        {measurementPoints.map((marker) => (
          <TouchableOpacity
            key={marker.id}
            style={[
              styles.markerButton,
              {
                backgroundColor:
                  selectedMarker?.id === marker.id
                    ? "rgba(255, 255, 255, 0)"
                    : "rgba(255, 255, 255, 0)",
                borderColor: getMarkerColor(marker.type!),
              },
            ]}
            onPress={() => onMarkerSelect(marker)}
          >
            <View
              style={[
                styles.markerIndicator,
                { backgroundColor: getMarkerColor(marker.type!) },
              ]}
            />
            <Text
              style={[
                styles.markerText,
                {
                  color:
                    selectedMarker?.id === marker.id
                      ? colors.white
                      : colors.white,
                  fontWeight:
                    selectedMarker?.id === marker.id ? "bold" : "normal",
                },
              ]}
              allowFontScaling={false}
            >
              {getMarkerLabel(marker.type!)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Joystick de controle */}
      {selectedMarker && (
        <View style={styles.joystickContainer}>
          <Text
            style={[styles.selectedMarkerText, { color: colors.white }]}
            allowFontScaling={false}
          >
            Controlando: {getMarkerLabel(selectedMarker.type!)}
          </Text>
          <Joystick
            onMove={handleJoystickMove}
            size={100}
            knobSize={40}
            backgroundColor={"rgba(255, 255, 255, 0.64)"}
            knobColor={getMarkerColor(selectedMarker.type!)}
            borderColor={"rgba(255, 255, 255, 0)"}
            sensitivity={1.5}
          />
          <Text
            style={[
              styles.instructionText,
              { color: "rgba(255, 255, 255, 0.05)" },
            ]}
            allowFontScaling={false}
          >
            Use o joystick para posicionar com precisão
          </Text>
          {isMoving && (
            <View
              style={[
                styles.movingIndicator,
                { backgroundColor: "rgba(0, 255, 0, 0.8)" },
              ]}
            >
              <Text
                style={[styles.movingText, { color: colors.background }]}
                allowFontScaling={false}
              >
                Movendo
              </Text>
            </View>
          )}
        </View>
      )}

      {!selectedMarker && (
        <View style={styles.noSelectionContainer}>
          <Text
            style={[
              styles.noSelectionText,
              { color: "rgba(255, 255, 255, 0.8)" },
            ]}
            allowFontScaling={false}
          >
            Selecione um marcador para controlar
          </Text>
        </View>
      )}

      {/* Botão para desmarcar */}
      {selectedMarker && (
        <TouchableOpacity
          style={[
            styles.deselectButton,
            {
              borderColor: "rgba(255, 255, 255, 0)",
              backgroundColor: "rgba(255, 255, 255, 0)",
            },
          ]}
          onPress={() => onMarkerSelect(null)}
        >
          <Text
            style={[styles.deselectText, { color: colors.white }]}
            allowFontScaling={false}
          >
            Desmarcar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  markerList: {
    marginBottom: 16,
  },
  markerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  markerIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  markerText: {
    fontSize: 16,
    flex: 1,
  },
  joystickContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  selectedMarkerText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  movingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  movingText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  noSelectionContainer: {
    padding: 20,
    alignItems: "center",
  },
  noSelectionText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  deselectButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    alignItems: "center",
  },
  deselectText: {
    fontSize: 14,
  },
});

export default MarkerControl;
