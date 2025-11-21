import { Component, OnInit, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NavController, AlertController, IonHeader, IonToolbar, IonButton, IonIcon,
  IonContent, IonCard, IonSearchbar,
} from '@ionic/angular/standalone';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, query, where, onSnapshot, getDocs } from '@angular/fire/firestore';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButton, IonIcon, IonContent, IonCard,
    IonSearchbar,
  ],
})
export class HomePage implements OnInit {
  userName: string = '...';
  nextAppointment: any = null;

  allDoctors: any[] = [];
  filteredDoctors: any[] = [];

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private zone = inject(NgZone);

  ngOnInit() {
    this.loadData();
    this.loadDoctors();
  }

  async loadDoctors() {
    try {
      const snap = await getDocs(collection(this.firestore, 'doctors'));
      this.allDoctors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.filteredDoctors = [...this.allDoctors];
    } catch (e) {
      console.error('Erro ao carregar médicos', e);
    }
  }

  handleSearch(event: any) {
    const queryText = event.target.value ? event.target.value.toLowerCase() : '';
    if (queryText.trim() === '') {
      this.filteredDoctors = [...this.allDoctors];
    } else {
      this.filteredDoctors = this.allDoctors.filter((doc) => 
        doc.name.toLowerCase().includes(queryText) || 
        doc.specialty.toLowerCase().includes(queryText)
      );
    }
  }

  joinMeet() {
    if (this.nextAppointment && this.nextAppointment.meetLink) {
      window.open(this.nextAppointment.meetLink, '_system');
    } else {
      this.presentAlert('Link Indisponível', 'Esta consulta não possui link.');
    }
  }

  bookDoctor(doctor: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: { doctorName: doctor.name }
    };
    this.navCtrl.navigateForward(['/agendamento'], navigationExtras);
  }

  loadData() {
    const user = this.auth.currentUser;
    
    if (user) {
        this.loadUserName(user);
        this.loadNextAppointment(user);
    } else {
        this.navCtrl.navigateRoot('/login');
    }
  }

  async loadUserName(user: any) {
    try {
      const snap = await getDoc(doc(this.firestore, `users/${user.uid}`));
      this.userName = snap.exists() ? snap.data()['nome'].split(' ')[0] : 'Usuário';
    } catch (e) { console.error(e); }
  }

  loadNextAppointment(user: any) {
    const q = query(collection(this.firestore, 'appointments'), where('userId', '==', user.uid));
    
    onSnapshot(q, (snapshot) => {
      this.zone.run(() => {
        const now = new Date();
        const allApts = snapshot.docs.map(doc => doc.data());
        
        const futureApts = allApts.filter((a: any) => {
          if (!a.dateIso || !a.timeLabel) return false;
          const datePart = new Date(a.dateIso);
          const [h, m] = a.timeLabel.split(':');
          datePart.setHours(parseInt(h), parseInt(m), 0, 0);
          return datePart >= now;
        });
        
        futureApts.sort((a: any, b: any) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime());
        
        if (futureApts.length > 0) {
          this.nextAppointment = futureApts[0];
        } else {
          this.nextAppointment = null;
        }
      });
    });
  }

  goToAppointments(section: string) {
    this.navCtrl.navigateForward(section === 'schedule' ? '/agendamento' : '/tabs/consultas');
  }

  async viewResults() { this.presentAlert('Em breve', 'Funcionalidade em desenvolvimento.'); }
  async contactSupport() { this.presentAlert('Suporte', 'Você será redirecionado.'); }
  
  private async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}