import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { Alert, Share } from "react-native";
import {
  MeasurementResults,
  ImageData,
  CalibrationData,
  MeasurementPoint,
} from "../types";

/**
 * Gera um HTML formatado para PDF com os resultados das medições
 */
export const generateReportHTML = (
  results: MeasurementResults,
  imageData?: ImageData,
  calibrationData?: CalibrationData,
  measurementPoints?: MeasurementPoint[],
  patientName?: string,
  capturedImageUri?: string
): string => {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Medições - Óculos</title>
      <style>
        @page {
          margin: 15mm;
          size: A4;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 0;
          color: #333;
          line-height: 1.4;
          font-size: 11px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007AFF;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .title {
          color: #007AFF;
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          color: #666;
          font-size: 11px;
          margin: 4px 0 0 0;
        }
        .patient-name {
          color: #333;
          font-size: 13px;
          font-weight: 600;
          margin: 6px 0 0 0;
        }
        .date {
          color: #999;
          font-size: 9px;
          margin: 3px 0 0 0;
        }
        .section {
          margin-bottom: 12px;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          border-left: 3px solid #007AFF;
        }
        .section-title {
          color: #007AFF;
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .measurement-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin-top: 6px;
        }
        .measurement-card {
          background: white;
          padding: 6px;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
          text-align: center;
        }
        .measurement-label {
          font-weight: bold;
          color: #333;
          font-size: 9px;
          margin-bottom: 2px;
        }
        .measurement-value {
          font-size: 14px;
          font-weight: bold;
          color: #007AFF;
          margin-bottom: 2px;
        }
        .measurement-description {
          font-size: 7px;
          color: #666;
          line-height: 1.1;
        }
        .info-section {
          background: #e8f4f8;
          border-left-color: #17a2b8;
          font-size: 9px;
          padding: 8px;
        }
        .info-list {
          margin: 4px 0;
          padding-left: 0;
        }
        .info-item {
          margin: 2px 0;
          padding-left: 10px;
          position: relative;
        }
        .info-item:before {
          content: "•";
          color: #17a2b8;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        .calibration-info {
          background: #fff3cd;
          border-left-color: #ffc107;
          font-size: 9px;
          padding: 6px;
        }
        .footer {
          margin-top: 10px;
          text-align: center;
          font-size: 7px;
          color: #999;
          border-top: 1px solid #e0e0e0;
          padding-top: 6px;
        }
        .image-section {
          text-align: center;
          margin: 10px 0;
        }
        .captured-image {
          max-width: 100%;
          max-height: 300px;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">📏 Relatório de Medições para Óculos</h1>
        <p class="subtitle">Medições precisas para fabricação de lentes</p>
        ${
          patientName
            ? `<p class="patient-name">Paciente: ${patientName}</p>`
            : ""
        }
        <p class="date">Gerado em: ${currentDate}</p>
      </div>

      <div class="section">
        <h2 class="section-title">📊 Resultados das Medições</h2>
        <div class="measurement-grid">
          <div class="measurement-card">
            <div class="measurement-label">DP Total</div>
            <div class="measurement-value">${results.dp.toFixed(1)} mm</div>
            <div class="measurement-description">Distância pupilar total</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">DPN Esq.</div>
            <div class="measurement-value">${results.dpnLeft.toFixed(
              1
            )} mm</div>
            <div class="measurement-description">Ponte até pupila esquerda</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">DPN Dir.</div>
            <div class="measurement-value">${results.dpnRight.toFixed(
              1
            )} mm</div>
            <div class="measurement-description">Ponte até pupila direita</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">Alt. Esq.</div>
            <div class="measurement-value">${results.heightLeft.toFixed(
              1
            )} mm</div>
            <div class="measurement-description">Altura óptica esquerda</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">Alt. Dir.</div>
            <div class="measurement-value">${results.heightRight.toFixed(
              1
            )} mm</div>
            <div class="measurement-description">Altura óptica direita</div>
          </div>
        </div>
      </div>

      ${
        calibrationData
          ? `
      <div class="section calibration-info">
        <h2 class="section-title">🎯 Informações de Calibração</h2>
        <p><strong>Escala:</strong> ${calibrationData.pixelsPerMM.toFixed(
          2
        )} pixels/mm | <strong>Pontos marcados:</strong> ${
              measurementPoints?.length || 0
            }</p>
      </div>
      `
          : ""
      }

      ${
        capturedImageUri
          ? `
      <div class="section">
        <h2 class="section-title">📸 Imagem com Marcadores</h2>
        <div class="image-section">
          <img src="data:image/png;base64,${capturedImageUri}" class="captured-image" alt="Imagem com marcadores de medição" />
          <p style="font-size: 9px; color: #666; margin-top: 5px;">
            Imagem mostrando os pontos de medição marcados durante a análise
          </p>
        </div>
      </div>
      `
          : ""
      }

      <div class="section info-section">
        <h2 class="section-title">ℹ️ Informações Importantes</h2>
        <div class="info-list">
          <div class="info-item">Medições essenciais para posicionamento correto das lentes</div>
          <div class="info-item">DP garante centralização das lentes com as pupilas</div>
          <div class="info-item">DPN crucial para lentes progressivas e bifocais</div>
          <div class="info-item">Altura óptica assegura conforto visual adequado</div>
          <div class="info-item">Consulte um profissional óptico para orientações específicas</div>
        </div>
      </div>

      <div class="footer">
        <p>Relatório gerado pelo App de Medição de Óculos</p>
        <p>⚠️ Para fins informativos. Consulte sempre um profissional óptico.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Gera e compartilha um PDF com os resultados
 */
export const shareResultsPDF = async (
  results: MeasurementResults,
  imageData?: ImageData,
  calibrationData?: CalibrationData,
  measurementPoints?: MeasurementPoint[],
  patientName?: string,
  capturedImageUri?: string
): Promise<void> => {
  try {
    // Converter a imagem para base64 se fornecida
    let imageBase64 = "";
    if (capturedImageUri) {
      try {
        imageBase64 = await FileSystem.readAsStringAsync(capturedImageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (error) {
        console.warn("Erro ao converter imagem para base64:", error);
      }
    }

    const html = generateReportHTML(
      results,
      imageData,
      calibrationData,
      measurementPoints,
      patientName,
      imageBase64
    );

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const fileName = `medicoes_oculos_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath, {
        mimeType: "application/pdf",
        dialogTitle: "Compartilhar Relatório de Medições",
      });
    } else {
      Alert.alert("PDF Gerado", `O relatório foi salvo em: ${fileName}`, [
        { text: "OK" },
      ]);
    }
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    Alert.alert(
      "Erro",
      "Não foi possível gerar o relatório PDF. Tente novamente.",
      [{ text: "OK" }]
    );
  }
};

/**
 * Compartilha apenas os resultados como texto
 */
export const shareResultsText = async (
  results: MeasurementResults,
  patientName?: string
): Promise<void> => {
  try {
    const patientInfo = patientName ? `\n👤 Paciente: ${patientName}\n` : "\n";

    const message = `
🔍 MEDIÇÕES PARA ÓCULOS${patientInfo}
📏 DP (Distância Pupilar Total): ${results.dp.toFixed(1)} mm
👁️ DPN Esquerda: ${results.dpnLeft.toFixed(1)} mm  
👁️ DPN Direita: ${results.dpnRight.toFixed(1)} mm
📐 Altura Óptica Esquerda: ${results.heightLeft.toFixed(1)} mm
📐 Altura Óptica Direita: ${results.heightRight.toFixed(1)} mm

📅 Data: ${new Date().toLocaleDateString("pt-BR")}
⏰ Hora: ${new Date().toLocaleTimeString("pt-BR")}

📱 Medido com App de Medição de Óculos
    `.trim();

    await Share.share({
      message: message,
      title: "Compartilhar Medições",
    });
  } catch (error) {
    console.error("Erro ao compartilhar texto:", error);
    Alert.alert(
      "Erro",
      "Não foi possível compartilhar os resultados. Tente novamente.",
      [{ text: "OK" }]
    );
  }
};
