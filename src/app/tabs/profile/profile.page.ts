import { Component, OnInit, inject, NgZone } from '@angular/core'; // Adicionado NgZone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonIcon, IonList, IonItem, IonLabel, NavController, AlertController 
} from '@ionic/angular/standalone';
// Adicionado onAuthStateChanged
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { 
  pencilOutline, documentTextOutline, timeOutline, 
  settingsOutline, helpCircleOutline, logOutOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButton, IonIcon, IonList, IonItem, IonLabel
  ]
})
export class ProfilePage implements OnInit {

  userName: string = 'Carregando...';
  userEmail: string = '...';
  userInitials: string = '';
  avatarColor: string = '#e2e8f0'; 

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private zone = inject(NgZone); // Necessário para atualizar a tela

  constructor() {
    addIcons({ 
      pencilOutline, documentTextOutline, timeOutline, 
      settingsOutline, helpCircleOutline, logOutOutline 
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    // CORREÇÃO: Usa o observador para garantir que o usuário carregou
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Atualiza email imediatamente
        this.zone.run(() => {
          this.userEmail = user.email || 'Sem email';
        });
        
        try {
          // Busca dados no Firestore
          const userDocRef = doc(this.firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          this.zone.run(() => {
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              this.userName = data['nome'] || 'Usuário';
              this.generateInitials(this.userName);
              this.avatarColor = '#dbeafe'; 
            } else {
              this.userName = 'Perfil não encontrado';
            }
          });
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      } else {
        // Se não tiver usuário, volta pro login
        this.navCtrl.navigateRoot('/login');
      }
    });
  }

  generateInitials(name: string) {
    // Pega apenas a primeira letra da string inteira
    if (name && name.length > 0) {
      this.userInitials = name.charAt(0).toUpperCase();
    } else {
      this.userInitials = 'U';
    }
  }

  goTo(page: string) {
    if (page === 'history') {
      this.navCtrl.navigateRoot('/tabs/consultas');
    } else if (page === 'settings') {
      this.presentAlert('Configurações', 'Em breve você poderá editar suas preferências.');
    } else if (page === 'documents') {
        this.presentAlert('Documentos', 'Em breve você poderá anexar exames.');
    } else if (page === 'help') {
      this.presentAlert('Ajuda', 'Entre em contato pelo email: suporte@medconecta.com');
    }
  }

  async editProfile() {
    this.presentAlert('Editar Perfil', 'Funcionalidade de edição em breve.');
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Sair',
      message: 'Tem certeza que deseja sair da sua conta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Sair', 
          role: 'destructive',
          handler: async () => {
            await signOut(this.auth);
            this.navCtrl.navigateRoot('/login');
          } 
        }
      ]
    });
    await alert.present();
  }

  private async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}