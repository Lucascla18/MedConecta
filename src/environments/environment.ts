import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false, // Deve ser false aqui para facilitar testes
  firebaseConfig: {
    apiKey: "AIzaSyCFmkO3czhMQr1tSWph5guBz9aIf9vUyFU",
    authDomain: "medconecta-app.firebaseapp.com",
    projectId: "medconecta-app",
    storageBucket: "medconecta-app.firebasestorage.app",
    messagingSenderId: "1069022374722",
    appId: "1:1069022374722:web:fb47fef9971896aa3236db"
  }
};