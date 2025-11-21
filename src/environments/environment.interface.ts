export interface Environment {
  production: boolean;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string; // Otimização: Tornado opcional (?) para evitar erros se não existir
  };
}