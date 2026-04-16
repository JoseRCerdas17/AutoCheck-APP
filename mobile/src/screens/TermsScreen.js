import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SECCIONES = [
  {
    titulo: '1. Aceptación de los términos',
    contenido:
      'Al descargar, instalar o usar AutoCheck APP, aceptás estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no uses la aplicación.',
  },
  {
    titulo: '2. Descripción del servicio',
    contenido:
      'AutoCheck APP es una aplicación móvil diseñada para ayudarte a registrar y gestionar el mantenimiento de tus vehículos. La app almacena información en servidores seguros y te permite consultar el historial de servicios, recibir alertas y guardar documentos.',
  },
  {
    titulo: '3. Uso de la cuenta',
    contenido:
      'Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Notificanos de inmediato si sospechás de algún uso no autorizado.',
  },
  {
    titulo: '4. Datos personales',
    contenido:
      'Recopilamos únicamente los datos necesarios para el funcionamiento de la app (nombre, correo electrónico, información de vehículos y mantenimientos). No vendemos ni compartimos tus datos con terceros. Las contraseñas se almacenan encriptadas con bcrypt.',
  },
  {
    titulo: '5. Contenido del usuario',
    contenido:
      'Sos responsable de la exactitud de la información que ingresás (kilometrajes, fechas, costos, documentos). AutoCheck no verifica la veracidad de los datos ingresados.',
  },
  {
    titulo: '6. Limitación de responsabilidad',
    contenido:
      'AutoCheck APP es una herramienta de apoyo para el seguimiento del mantenimiento vehicular. Las alertas y recordatorios son estimaciones basadas en los datos que ingresás. La aplicación no reemplaza el criterio de un mecánico calificado.',
  },
  {
    titulo: '7. Modificaciones',
    contenido:
      'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia al ser publicados dentro de la aplicación. El uso continuo de la app después de los cambios implica la aceptación de los nuevos términos.',
  },
  {
    titulo: '8. Cancelación',
    contenido:
      'Podés eliminar tu cuenta en cualquier momento. Al hacerlo, todos tus datos (vehículos, mantenimientos y documentos) serán eliminados permanentemente de nuestros servidores.',
  },
  {
    titulo: '9. Contacto',
    contenido:
      'Si tenés preguntas sobre estos Términos y Condiciones, podés contactarnos a través de la sección de Ayuda y soporte dentro de la aplicación.',
  },
];

export default function TermsScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Términos y condiciones</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          Versión 1.0 — Vigente desde 2025
        </Text>

        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Estos Términos y Condiciones regulan el uso de AutoCheck APP. Por favor leelos detenidamente antes de usar la aplicación.
        </Text>

        {SECCIONES.map((sec, index) => (
          <View key={index} style={[styles.seccion, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.seccionTitulo, { color: theme.primary }]}>{sec.titulo}</Text>
            <Text style={[styles.seccionContenido, { color: theme.text }]}>{sec.contenido}</Text>
          </View>
        ))}

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
  versionText: { fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  intro: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 20, marginTop: 8 },
  seccion: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 10 },
  seccionTitulo: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  seccionContenido: { fontSize: 13, lineHeight: 21 },
});
