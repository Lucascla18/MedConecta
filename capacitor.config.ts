import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medconecta.app',
  appName: 'MedConecta',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      // IMPORTANTE: O app começa DEPOIS da barra (não fica por trás)
      overlay: false, 
      
      // Reforça a cor branca (caso o XML falhe em alguma versão antiga)
      backgroundColor: '#FFFFFF', 
      
      // Ícones Escuros
      style: 'DARK' 
    },
    Keyboard: {
      // Evita que o teclado deforme o app
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true
    }
  }
};

export default config;