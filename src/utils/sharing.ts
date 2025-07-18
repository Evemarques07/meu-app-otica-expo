import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { Alert, Share } from 'react-native';
import { MeasurementResults, ImageData, CalibrationData, MeasurementPoint } from '../types';

/**
 * Gera um HTML formatado para PDF com os resultados das medições
 */
export const generateReportHTML = (
  results: MeasurementResults,
  imageData?: ImageData,
  calibrationData?: CalibrationData,
  measurementPoints?: MeasurementPoint[]
): string => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Medições - Óculos</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007AFF;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          color: #007AFF;
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          color: #666;
          font-size: 16px;
          margin: 10px 0 0 0;
        }
        .date {
          color: #999;
          font-size: 14px;
          margin: 5px 0 0 0;
        }
        .section {
          margin-bottom: 25px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #007AFF;
        }
        .section-title {
          color: #007AFF;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        .measurement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .measurement-card {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .measurement-label {
          font-weight: bold;
          color: #333;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .measurement-value {
          font-size: 24px;
          font-weight: bold;
          color: #007AFF;
          margin-bottom: 5px;
        }
        .measurement-description {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
        .info-section {
          background: #e8f4f8;
          border-left-color: #17a2b8;
        }
        .info-list {
          margin: 10px 0;
          padding-left: 0;
        }
        .info-item {
          margin: 8px 0;
          padding-left: 20px;
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
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">📏 Relatório de Medições para Óculos</h1>
        <p class="subtitle">Medições precisas para fabricação de lentes</p>
        <p class="date">Gerado em: ${currentDate}</p>
      </div>

      <div class="section">
        <h2 class="section-title">📊 Resultados das Medições</h2>
        <div class="measurement-grid">
          <div class="measurement-card">
            <div class="measurement-label">👁️ DP - Distância Pupilar Total</div>
            <div class="measurement-value">${results.dp.toFixed(1)} mm</div>
            <div class="measurement-description">Distância entre o centro das duas pupilas</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">👁️ DPN Esquerda</div>
            <div class="measurement-value">${results.dpnLeft.toFixed(1)} mm</div>
            <div class="measurement-description">Centro da ponte nasal até pupila esquerda</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">👁️ DPN Direita</div>
            <div class="measurement-value">${results.dpnRight.toFixed(1)} mm</div>
            <div class="measurement-description">Centro da ponte nasal até pupila direita</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">📐 Altura Óptica Esquerda</div>
            <div class="measurement-value">${results.heightLeft.toFixed(1)} mm</div>
            <div class="measurement-description">Base da lente até centro da pupila esquerda</div>
          </div>
          
          <div class="measurement-card">
            <div class="measurement-label">📐 Altura Óptica Direita</div>
            <div class="measurement-value">${results.heightRight.toFixed(1)} mm</div>
            <div class="measurement-description">Base da lente até centro da pupila direita</div>
          </div>
        </div>
      </div>

      ${calibrationData ? `
      <div class="section calibration-info">
        <h2 class="section-title">🎯 Informações de Calibração</h2>
        <p><strong>Escala utilizada:</strong> ${calibrationData.pixelsPerMM.toFixed(2)} pixels por milímetro</p>
        <p><strong>Referência:</strong> Cartão de crédito padrão (85,6 mm de largura)</p>
        <p><strong>Pontos marcados:</strong> ${measurementPoints?.length || 0} pontos de medição</p>
      </div>
      ` : ''}

      <div class="section info-section">
        <h2 class="section-title">ℹ️ Informações Importantes</h2>
        <div class="info-list">
          <div class="info-item">Estas medições são essenciais para o correto posicionamento das lentes</div>
          <div class="info-item">A DPN (Distância Pupilar Nasal) é crucial para lentes progressivas</div>
          <div class="info-item">A altura óptica determina a posição vertical da lente no aro</div>
          <div class="info-item">Todas as medições foram calculadas com base em padrões ópticos internacionais</div>
          <div class="info-item">Em caso de dúvidas, consulte um profissional óptico qualificado</div>
        </div>
      </div>

      <div class="footer">
        <p>Relatório gerado pelo App de Medição de Óculos</p>
        <p>⚠️ Este relatório é para fins informativos. Consulte sempre um profissional óptico.</p>
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
  measurementPoints?: MeasurementPoint[]
): Promise<void> => {
  try {
    const html = generateReportHTML(results, imageData, calibrationData, measurementPoints);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const fileName = `medições_oculos_${new Date().toISOString().split('T')[0]}.pdf`;
    const newPath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Relatório de Medições',
      });
    } else {
      Alert.alert(
        'PDF Gerado',
        `O relatório foi salvo em: ${fileName}`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    Alert.alert(
      'Erro',
      'Não foi possível gerar o relatório PDF. Tente novamente.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Compartilha apenas os resultados como texto
 */
export const shareResultsText = async (results: MeasurementResults): Promise<void> => {
  try {
    const message = `
🔍 MEDIÇÕES PARA ÓCULOS

📏 DP (Distância Pupilar Total): ${results.dp.toFixed(1)} mm
👁️ DPN Esquerda: ${results.dpnLeft.toFixed(1)} mm  
👁️ DPN Direita: ${results.dpnRight.toFixed(1)} mm
📐 Altura Óptica Esquerda: ${results.heightLeft.toFixed(1)} mm
📐 Altura Óptica Direita: ${results.heightRight.toFixed(1)} mm

📅 Data: ${new Date().toLocaleDateString('pt-BR')}
⏰ Hora: ${new Date().toLocaleTimeString('pt-BR')}

📱 Medido com App de Medição de Óculos
    `.trim();

    await Share.share({
      message: message,
      title: 'Compartilhar Medições'
    });
  } catch (error) {
    console.error('Erro ao compartilhar texto:', error);
    Alert.alert(
      'Erro',
      'Não foi possível compartilhar os resultados. Tente novamente.',
      [{ text: 'OK' }]
    );
  }
};
