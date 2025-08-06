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
          margin: 10mm;
          size: A4;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 0;
          color: #333;
          line-height: 1.3;
          font-size: 10px;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          background: linear-gradient(135deg, #007AFF, #0056CC);
          color: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 8px rgba(0,122,255,0.2);
        }
        .header h1 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        .header .subtitle {
          font-size: 11px;
          opacity: 0.9;
          margin: 0;
        }
        .patient-info {
          background: #f8f9fa;
          padding: 8px 15px;
          border-radius: 6px;
          margin: 8px 0;
          border-left: 4px solid #007AFF;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .patient-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        .date-info {
          font-size: 9px;
          color: #666;
        }
        .main-content {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 15px;
          margin-bottom: 15px;
        }
        .measurements-section {
          background: white;
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 15px;
        }
        .section-title {
          color: #007AFF;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .measurements-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .measurement-card {
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: all 0.2s;
        }
        .measurement-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .measurement-label {
          font-weight: 600;
          color: #475569;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .measurement-value {
          font-size: 18px;
          font-weight: bold;
          color: #007AFF;
          margin-bottom: 3px;
        }
        .measurement-description {
          font-size: 8px;
          color: #64748b;
          line-height: 1.2;
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .image-preview {
          background: white;
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
        }
        .captured-image {
          width: 100%;
          max-height: 160px;
          object-fit: contain;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .calibration-box {
          background: #fef3e2;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 10px;
        }
        .calibration-title {
          color: #f59e0b;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .calibration-data {
          font-size: 9px;
          color: #92400e;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .info-panel {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
        }
        .info-title {
          color: #1e40af;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          font-size: 8px;
          color: #1e40af;
        }
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 4px;
        }
        .info-bullet {
          color: #3b82f6;
          font-weight: bold;
          margin-top: 1px;
        }
        .footer {
          text-align: center;
          font-size: 8px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 15px;
        }
        .footer-brand {
          font-weight: 600;
          color: #007AFF;
        }
        .disclaimer {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 8px;
          margin-top: 5px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📏 Relatório de Medições Oftálmicas</h1>
          <p class="subtitle">Medições precisas para fabricação de lentes corretivas</p>
        </div>

        ${
          patientName
            ? `
        <div class="patient-info">
          <div class="patient-name">👤 ${patientName}</div>
          <div class="date-info">📅 ${currentDate}</div>
        </div>
        `
            : `
        <div class="patient-info">
          <div class="patient-name">📋 Relatório de Medições</div>
          <div class="date-info">📅 ${currentDate}</div>
        </div>
        `
        }

        <div class="main-content">
          <div class="measurements-section">
            <h2 class="section-title">📊 Resultados das Medições</h2>
            <div class="measurements-grid">
              <div class="measurement-card">
                <div class="measurement-label">DP Total</div>
                <div class="measurement-value">${results.dp.toFixed(1)} mm</div>
                <div class="measurement-description">Distância entre centros das pupilas</div>
              </div>
              
              <div class="measurement-card">
                <div class="measurement-label">DPN Esquerda</div>
                <div class="measurement-value">${results.dpnLeft.toFixed(
                  1
                )} mm</div>
                <div class="measurement-description">Centro da ponte nasal até pupila esquerda</div>
              </div>
              
              <div class="measurement-card">
                <div class="measurement-label">DPN Direita</div>
                <div class="measurement-value">${results.dpnRight.toFixed(
                  1
                )} mm</div>
                <div class="measurement-description">Centro da ponte nasal até pupila direita</div>
              </div>
              
              <div class="measurement-card">
                <div class="measurement-label">Altura Óptica</div>
                <div class="measurement-value">${results.heightLeft.toFixed(
                  1
                )} | ${results.heightRight.toFixed(1)} mm</div>
                <div class="measurement-description">Altura das lentes (Esq. | Dir.)</div>
              </div>
            </div>
          </div>

          <div class="sidebar">
            ${
              capturedImageUri
                ? `
            <div class="image-preview">
              <h3 class="section-title">📸 Imagem Analisada</h3>
              <img src="data:image/png;base64,${capturedImageUri}" class="captured-image" alt="Análise com marcadores" />
            </div>
            `
                : ""
            }
            
            ${
              calibrationData
                ? `
            <div class="calibration-box">
              <div class="calibration-title">🎯 Dados de Calibração</div>
              <div class="calibration-data">
                <span><strong>Escala:</strong> ${calibrationData.pixelsPerMM.toFixed(
                  2
                )} px/mm</span>
                <span><strong>Pontos:</strong> ${
                  measurementPoints?.length || 0
                } marcadores</span>
              </div>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="info-panel">
          <div class="info-title">ℹ️ Informações Técnicas</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-bullet">•</span>
              <span>DP: Essencial para centralização das lentes</span>
            </div>
            <div class="info-item">
              <span class="info-bullet">•</span>
              <span>DPN: Crítica para lentes progressivas</span>
            </div>
            <div class="info-item">
              <span class="info-bullet">•</span>
              <span>Altura: Determina conforto visual</span>
            </div>
            <div class="info-item">
              <span class="info-bullet">•</span>
              <span>Consulte profissional óptico certificado</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><span class="footer-brand">App de Medição Oftálmica</span> - Tecnologia de precisão para ópticas</p>
          <div class="disclaimer">
            ⚠️ Este relatório é para fins informativos. Sempre consulte um profissional óptico qualificado.
          </div>
        </div>
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
