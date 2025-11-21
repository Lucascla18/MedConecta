import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ToastController, AlertController, IonHeader, IonToolbar, IonTitle, IonSegment, IonSegmentButton,
  IonLabel, IonContent, IonCard, IonItem, IonIcon, IonButton, NavController
} from '@ionic/angular/standalone';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, query, where, onSnapshot, deleteDoc, doc } from '@angular/fire/firestore';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonSegment, IonSegmentButton, IonLabel,
    IonContent, IonCard, IonItem, IonIcon, IonButton
  ]
})
export class ConsultasPage implements OnInit {
  selectedSegment: string = 'upcoming';
  displayedAppointments: any[] = [];
  
  private upcomingList: any[] = [];
  private pastList: any[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private zone = inject(NgZone);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private navCtrl = inject(NavController);

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const q = query(
          collection(this.firestore, 'appointments'),
          where('userId', '==', user.uid)
        );

        onSnapshot(q, (snapshot) => {
          this.zone.run(() => {
            const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            this.upcomingList = [];
            this.pastList = [];
            const now = new Date(); // Data/Hora exata de AGORA

            rawData.forEach((apt: any) => {
              if (!apt.dateIso || !apt.timeLabel) return;

              // 1. Monta a data completa (Dia + Hora)
              const aptDate = new Date(apt.dateIso);
              const [hours, minutes] = apt.timeLabel.split(':');
              aptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

              apt.fullDate = aptDate; // Salva para usar na ordenação

              // 2. Separa Futuro vs Passado
              if (aptDate >= now) {
                this.upcomingList.push(apt);
              } else {
                this.pastList.push(apt);
              }
            });

            // --- ORDENAÇÃO CORRIGIDA ---

            // PRÓXIMAS: Da mais Próxima (Menor data) para a Mais Longe (Maior data)
            // Ex: Hoje (top) -> Amanhã -> Mês que vem (bottom)
            this.upcomingList.sort((a: any, b: any) => {
              return a.fullDate.getTime() - b.fullDate.getTime();
            });

            // ANTERIORES: Da mais Recente para a Mais Antiga
            // Ex: Ontem (top) -> Semana passada -> Ano passado (bottom)
            this.pastList.sort((a: any, b: any) => {
              return b.fullDate.getTime() - a.fullDate.getTime();
            });
            
            this.updateDisplay();
          });
        });
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }

  segmentChanged(event?: any) {
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.selectedSegment === 'upcoming') {
      this.displayedAppointments = this.upcomingList;
    } else {
      this.displayedAppointments = this.pastList;
    }
  }

  // REMARCAR
  async reschedule(apt: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        doctorName: apt.doctorName
      }
    };
    this.navCtrl.navigateForward(['/agendamento'], navigationExtras);
  }

  // CANCELAR
  async cancelAppointment(apt: any) {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar Consulta?',
      message: `Deseja cancelar o agendamento com ${apt.doctorName}?`,
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, cancelar',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteDoc(doc(this.firestore, 'appointments', apt.id));
              this.presentToast('Consulta cancelada com sucesso.');
            } catch (e) {
              console.error(e);
              this.presentToast('Erro ao cancelar.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color: 'dark' });
    toast.present();
  }
}