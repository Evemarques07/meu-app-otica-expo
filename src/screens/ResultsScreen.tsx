import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { MeasurementResults } from '../types';

interface ResultsScreenProps {
  results: MeasurementResults;
  onStartNew: () => void;
  onBack: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  results,
  onStartNew,
  onBack,
}) => {
  const handleShare = async () => {
    try {
      const message = `
Medições para Óculos - Resultados:

📏 DP (Distância Pupilar Total): ${results.dp} mm
👁️ DPN Esquerda: ${results.dpnLeft} mm  
👁️ DPN Direita: ${results.dpnRight} mm
📐 Altura Óptica Esquerda: ${results.heightLeft} mm
📐 Altura Óptica Direita: ${results.heightRight} mm

Medido com App de Medição de Óculos
Data: ${new Date().toLocaleDateString('pt-BR')}
      `.trim();

      await Share.share({
        message,
        title: 'Medições para Óculos',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar os resultados.');
    }
  };

  const getMeasurementCard = (
    title: string,
    value: number,
    unit: string,
    description: string,
    icon: string
  ) => (
    <View style={styles.measurementCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>
        {value} <Text style={styles.cardUnit}>{unit}</Text>
      </Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Resultados</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Medições Concluídas!</Text>
          <Text style={styles.successSubtitle}>
            Todas as medições foram calculadas com sucesso
          </Text>
        </View>

        <View style={styles.measurementsContainer}>
          <Text style={styles.sectionTitle}>Medições Principais</Text>
          
          {getMeasurementCard(
            'DP - Distância Pupilar Total',
            results.dp,
            'mm',
            'Distância entre o centro das duas pupilas',
            '👁️'
          )}

          <View style={styles.dpnContainer}>
            <Text style={styles.subsectionTitle}>DPN - Distância Pupilar Nasal</Text>
            <View style={styles.dpnRow}>
              {getMeasurementCard(
                'DPN Esquerda',
                results.dpnLeft,
                'mm',
                'Centro da ponte até pupila esquerda',
                '👁️'
              )}
              {getMeasurementCard(
                'DPN Direita',
                results.dpnRight,
                'mm',
                'Centro da ponte até pupila direita',
                '👁️'
              )}
            </View>
          </View>

          <View style={styles.heightContainer}>
            <Text style={styles.subsectionTitle}>Altura Óptica</Text>
            <View style={styles.heightRow}>
              {getMeasurementCard(
                'Altura Esquerda',
                results.heightLeft,
                'mm',
                'Base da lente até centro da pupila',
                '📐'
              )}
              {getMeasurementCard(
                'Altura Direita',
                results.heightRight,
                'mm',
                'Base da lente até centro da pupila',
                '📐'
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ Informações Importantes</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Estas medições são essenciais para garantir o correto posicionamento das lentes
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              A DP garante que as lentes fiquem centralizadas com suas pupilas
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              A altura óptica assegura o conforto visual adequado
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Leve estas medições ao seu oftalmologista ou ótica de confiança
            </Text>
          </View>
        </View>

        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>
            Medição realizada em: {new Date().toLocaleString('pt-BR')}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.newMeasurementButton} onPress={onStartNew}>
          <Text style={styles.newMeasurementButtonText}>
            📷 Nova Medição
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  shareButton: {
    padding: 5,
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  successBanner: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
  measurementsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    marginTop: 20,
  },
  measurementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  cardUnit: {
    fontSize: 16,
    color: '#666',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
  },
  dpnContainer: {
    marginTop: 20,
  },
  dpnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heightContainer: {
    marginTop: 20,
  },
  heightRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 14,
    color: '#FF9800',
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#BF360C',
    flex: 1,
    lineHeight: 18,
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  newMeasurementButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newMeasurementButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ResultsScreen;
