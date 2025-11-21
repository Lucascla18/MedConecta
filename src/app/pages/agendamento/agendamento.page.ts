import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonContent, IonLabel, IonItem, IonDatetime, IonButton, 
  IonModal, IonSearchbar, IonList, IonAvatar, IonIcon,
  NavController, ToastController, LoadingController 
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';

// IMPORTAÇÃO CORRIGIDA: Adicionado LocalNotificationSchema para tipagem
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';

@Component({
  selector: 'app-agendamento',
  templateUrl: './agendamento.page.html',
  styleUrls: ['./agendamento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonLabel, IonItem, IonDatetime, IonButton,
    IonModal, IonSearchbar, IonList, IonAvatar, IonIcon
  ]
})
export class AgendamentoPage implements OnInit {
  pageTitle = 'Agendar Consulta';
  
  doctorsList: any[] = [];
  filteredDoctors: any[] = [];
  selectedDoctor: any = null;
  isDoctorModalOpen = false;

  morningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  afternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
  
  selectedTime: string | null = null;
  selectedDate: string = new Date().toISOString();
  minDate: string = new Date().toISOString();

  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  async ngOnInit() {
    await this.loadDoctorsFromFirebase();
    await this.requestNotificationPermission();

    this.route.queryParams.subscribe(params => {
      if (params && params['doctorName']) {
        const found = this.doctorsList.find(d => d.name === params['doctorName']);
        if (found) this.selectedDoctor = found;
      }
    });
  }

  async requestNotificationPermission() {
    const result = await LocalNotifications.requestPermissions();
    if (result.display !== 'granted') {
      console.log('Permissão de notificação negada');
    }
  }

  async loadDoctorsFromFirebase() {
    try {
      const snap = await getDocs(collection(this.firestore, 'doctors'));
      this.doctorsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.filteredDoctors = [...this.doctorsList];
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    }
  }

  setOpen(isOpen: boolean) {
    this.isDoctorModalOpen = isOpen;
    if (isOpen) this.filteredDoctors = [...this.doctorsList];
  }

  searchDoctor(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredDoctors = this.doctorsList.filter((d: any) => 
      d.name.toLowerCase().includes(query) || d.specialty.toLowerCase().includes(query)
    );
  }

  selectDoctor(doc: any) {
    this.selectedDoctor = doc;
    this.setOpen(false);
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  generateMeetLink() {
    const p1 = Math.random().toString(36).substring(2, 5); 
    const p2 = Math.random().toString(36).substring(2, 6); 
    const p3 = Math.random().toString(36).substring(2, 5); 
    return `https://meet.google.com/${p1}-${p2}-${p3}`;
  }

  async saveAppointment() {
    if (!this.selectedDoctor || !this.selectedTime) return;
    const user = this.auth.currentUser;
    if (!user) return;

    const loading = await this.loadingCtrl.create({ message: 'Agendando...' });
    await loading.present();

    try {
      const uniqueLink = this.generateMeetLink();
      const appointmentData = {
        userId: user.uid,
        doctorName: this.selectedDoctor.name,
        specialty: this.selectedDoctor.specialty,
        doctorColor: this.selectedDoctor.color,
        doctorInitials: this.selectedDoctor.initials,
        dateIso: this.selectedDate,
        dateLabel: new Date(this.selectedDate).toLocaleDateString('pt-BR'),
        timeLabel: this.selectedTime,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        meetLink: uniqueLink 
      };

      await addDoc(collection(this.firestore, 'appointments'), appointmentData);
      await this.scheduleAdvancedNotifications();

      loading.dismiss();
      this.showToast('Consulta agendada! Lembretes definidos.');
      this.navCtrl.navigateBack('/tabs/home');
    } catch (error) {
      loading.dismiss();
      this.showToast('Erro ao agendar.');
    }
  }

  // --- LÓGICA AVANÇADA DE NOTIFICAÇÕES ---
  async scheduleAdvancedNotifications() {
    const appointmentDate = new Date(this.selectedDate);
    const [hours, minutes] = this.selectedTime!.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    
    // CORREÇÃO AQUI: Tipagem explícita para evitar erro TS7034
    const notifications: LocalNotificationSchema[] = [];
    
    const baseId = Math.floor(Math.random() * 100000);

    const trySchedule = (triggerDate: Date, title: string, body: string, idOffset: number, windowMs: number) => {
      const timeLeft = appointmentDate.getTime() - now.getTime();
      
      // 1. Futuro normal: Agenda para a data certa
      if (triggerDate > now) {
        notifications.push({
          title, body, id: baseId + idOffset,
          schedule: { at: triggerDate },
          sound: 'default', attachments: [], actionTypeId: '', extra: null
        });
      } 
      // 2. Passou do ponto, mas está dentro da janela relevante: Manda AGORA
      else if (timeLeft > 0 && timeLeft < (appointmentDate.getTime() - triggerDate.getTime()) && timeLeft > windowMs) {
        notifications.push({
          title, body, id: baseId + idOffset,
          schedule: { at: new Date(now.getTime() + 2000) }, // +2s para garantir
          sound: 'default', attachments: [], actionTypeId: '', extra: null
        });
      }
    };

    // Conversões de Tempo
    const MIN_15 = 15 * 60 * 1000;
    const HOUR_1 = 60 * 60 * 1000;
    const HOUR_6 = 6 * 60 * 60 * 1000;
    const HOUR_24 = 24 * 60 * 60 * 1000;
    const HOUR_48 = 48 * 60 * 60 * 1000;

    // 1. AVISO DE 48H (2 Dias Antes)
    const date48h = new Date(appointmentDate.getTime() - HOUR_48);
    trySchedule(date48h, '📅 Em 2 dias', `Sua consulta com ${this.selectedDoctor.name} está chegando.`, 1, HOUR_24);

    // 2. AVISO DE 24H ("É Amanhã")
    const date24h = new Date(appointmentDate.getTime() - HOUR_24);
    trySchedule(date24h, '🔔 É Amanhã!', `Não esqueça sua consulta às ${this.selectedTime}.`, 2, HOUR_6);

    // 3. AVISO DE 6H ("É Hoje")
    const date6h = new Date(appointmentDate.getTime() - HOUR_6);
    trySchedule(date6h, '🌟 É Hoje!', `Sua consulta é hoje às ${this.selectedTime}.`, 3, HOUR_1);

    // 4. AVISO DE 1H ("Falta 1 Hora")
    const date1h = new Date(appointmentDate.getTime() - HOUR_1);
    trySchedule(date1h, '⏰ Falta 1 hora', `Prepare-se para o atendimento.`, 4, MIN_15);

    // 5. AVISO DE 15 MIN (Imediato/Urgente)
    const date15m = new Date(appointmentDate.getTime() - MIN_15);
    trySchedule(date15m, '🎥 Começa em 15 min', `Acesse o app e verifique sua conexão.`, 5, 0);

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`${notifications.length} notificações agendadas.`);
    }
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 3000, position: 'bottom', color: 'dark'
    });
    toast.present();
  }
}