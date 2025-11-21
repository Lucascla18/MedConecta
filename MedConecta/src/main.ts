import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// --- IMPORTAÇÕES DO FIREBASE ---
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Otimização: Ativa o modo de produção se não estiver em desenvolvimento
if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    
    // Mantive sua otimização de PreloadAllModules
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // --- INICIALIZAÇÃO DO FIREBASE ---
    // Conecta usando as chaves corrigidas do environment
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    
    // Habilita Autenticação, Banco de Dados e Armazenamento de Arquivos
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()), 
  ],
});