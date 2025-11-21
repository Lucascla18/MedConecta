import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { StatusBar } from '@capacitor/status-bar';
import { addIcons } from 'ionicons';

import {
  // --- Ícones Novos Mais Bonitos ---
  calendarNumberOutline, // Para Agendar
  readerOutline,         // Para Minhas Consultas (Prontuário)
  flaskOutline,          // Para Resultados (Exames/Lab)
  headsetOutline,        // Para Suporte
  
  // Navegação (Tabs)
  homeOutline, home,
  calendarOutline, calendar,
  personCircleOutline, personCircle,

  // Ações Gerais
  notificationsOutline,
  addCircleOutline,
  receiptOutline,
  documentTextOutline,
  chatbubblesOutline,
  searchOutline,
  videocamOutline,
  timeOutline,
  trashOutline,
  closeOutline,
  
  // Especialidades
  pulseOutline,
  heartOutline,
  bodyOutline,
  happyOutline,
  earOutline,

  // Status
  checkmarkDoneOutline,
  checkmarkCircleOutline,
  checkmarkCircle,

  // Perfil
  pencilOutline,
  documentAttachOutline,
  archiveOutline,
  settingsOutline,
  helpBuoyOutline,
  helpCircleOutline,
  logOutOutline,
  
  // Social
  logoGoogle,
  logoFacebook,
  logoApple
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CommonModule],
})
export class AppComponent implements OnInit {
  
  constructor() {
    this.registerIcons();
  }

  async ngOnInit() {
    try {
      await StatusBar.hide();
    } catch (e) {
      console.log('StatusBar error', e);
    }
  }

  private registerIcons() {
    addIcons({
      // Novos Ícones Temáticos
      calendarNumberOutline,
      readerOutline,
      flaskOutline,
      headsetOutline,

      // Tabs
      homeOutline, home,
      calendarOutline, calendar,
      personCircleOutline, personCircle,

      // UI Elements
      notificationsOutline,
      addCircleOutline,
      receiptOutline,
      documentTextOutline,
      chatbubblesOutline,
      searchOutline,
      videocamOutline,
      timeOutline,
      trashOutline,
      closeOutline,

      // Especialidades
      pulseOutline,
      heartOutline,
      bodyOutline,
      happyOutline,
      earOutline,

      // Status
      checkmarkDoneOutline,
      checkmarkCircleOutline,
      checkmarkCircle,

      // Perfil
      pencilOutline,
      documentAttachOutline,
      archiveOutline,
      settingsOutline,
      helpBuoyOutline,
      helpCircleOutline,
      logOutOutline,

      // Social
      logoGoogle,
      logoFacebook,
      logoApple
    });
  }
}