import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FAQS = [
  {
    pregunta: '¿Puedo tener más de un vehículo?',
    respuesta: 'Sí. Podés registrar todos los vehículos que necesités. Cada uno tiene su propio historial de mantenimientos.',
  },
  {
    pregunta: '¿Qué pasa si elimino un vehículo?',
    respuesta: 'Se eliminan también todos sus mantenimientos y documentos. Esta acción no se puede deshacer.',
  },
  {
    pregunta: '¿Los datos están seguros?',
    respuesta: 'Sí. Las contraseñas se almacenan encriptadas con bcrypt y la comunicación usa HTTPS.',
  },
  {
    pregunta: '¿Puedo usar la app sin internet?',
    respuesta: 'La app necesita conexión a internet para sincronizar datos con el servidor.',
  },
  {
    pregunta: '¿Cómo funcionan las alertas?',
    respuesta: 'AutoCheck calcula automáticamente cuándo necesitás hacer mantenimiento según el kilometraje actual de tu vehículo y los límites recomendados.',
  },
  {
    pregunta: '¿Cómo subo documentos?',
    respuesta: 'En la sección Documentos, tocá cualquier tarjeta (RITEVE, Seguro, Marchamo, etc.) y elegí una imagen de tu galería o cámara.',
  },
  {
    pregunta: 'Olvidé mi contraseña, ¿qué hago?',
    respuesta: 'En la pantalla de inicio de sesión tocá "¿Olvidé mi contraseña?", ingresá tu correo y recibirás un código de 6 dígitos para restablecer tu contraseña.',
  },
];

export default function HelpScreen({ navigation }) {
  const { theme } = useTheme();
  const [expandido, setExpandido] = React.useState(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Ayuda y soporte</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: theme.primary + '18' }]}>
          <Ionicons name="help-circle" size={40} color={theme.primary} />
          <Text style={[styles.bannerTitle, { color: theme.text }]}>¿En qué podemos ayudarte?</Text>
          <Text style={[styles.bannerSubtitle, { color: theme.textSecondary }]}>
            Encontrá respuestas a las preguntas más frecuentes sobre AutoCheck APP.
          </Text>
        </View>

        {/* Preguntas frecuentes */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preguntas frecuentes</Text>

        {FAQS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setExpandido(expandido === index ? null : index)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqPregunta, { color: theme.text }]}>{item.pregunta}</Text>
              <Ionicons
                name={expandido === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.textSecondary}
              />
            </View>
            {expandido === index && (
              <Text style={[styles.faqRespuesta, { color: theme.textSecondary }]}>{item.respuesta}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contacto */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Contacto</Text>

        <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.contactRow}>
            <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
              <MaterialIcons name="email" size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.contactLabel, { color: theme.textSecondary }]}>Correo de soporte</Text>
              <Text style={[styles.contactValue, { color: theme.text }]}>soporte@autocheck.app</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.contactRow}>
            <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="time-outline" size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.contactLabel, { color: theme.textSecondary }]}>Horario de atención</Text>
              <Text style={[styles.contactValue, { color: theme.text }]}>Lunes a viernes, 8am – 5pm</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  content: { padding: 16 },
  banner: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, marginTop: 8 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  bannerSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 12, marginTop: 8, marginLeft: 4,
  },
  faqCard: {
    borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 8,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqPregunta: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  faqRespuesta: { fontSize: 13, lineHeight: 20, marginTop: 12 },
  contactCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  contactIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { fontSize: 12, marginBottom: 2 },
  contactValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 16 },
});
