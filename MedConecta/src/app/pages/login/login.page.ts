import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  NavController,
  LoadingController,
  ToastController,
  AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { medkitOutline, logoGoogle, logoFacebook, logoApple } from 'ionicons/icons';
// Importei o authState aqui para verificar a sessão
import { Auth, signInWithEmailAndPassword, sendPasswordResetEmail, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
  ],
})
export class LoginPage implements OnInit {
  public email = '';
  public senha = '';

  private navCtrl = inject(NavController);
  private auth = inject(Auth);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ medkitOutline, logoGoogle, logoFacebook, logoApple });
  }

  ngOnInit() {
    // Verifica se já existe sessão ativa
    authState(this.auth).subscribe(user => {
      if (user) {
        console.log('Usuário detectado, redirecionando...');
        this.navCtrl.navigateRoot('/tabs/home');
      }
    });
  }

  async handleLogin() {
    const emailLimpo = this.email.trim();
    const senhaLimpa = this.senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      this.showErrorToast('Por favor, preencha e-mail e senha.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Entrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      await signInWithEmailAndPassword(
        this.auth,
        emailLimpo,
        senhaLimpa
      );
      
      // Não precisa navegar manualmente aqui, o ngOnInit já vai detectar
      // a mudança de estado e redirecionar, mas por segurança mantemos:
      console.log('Login OK');
      this.email = '';
      this.senha = '';
      this.navCtrl.navigateRoot('/tabs/home');

    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      await loading.dismiss();
    }
  }

  async recoverPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Redefinir Senha',
      message: 'Informe seu e-mail para receber o link de redefinição.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'seuemail@exemplo.com',
          value: this.email 
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (!data.email) {
              this.showErrorToast('Por favor, digite um e-mail.');
              return false; 
            }
            this.sendResetLink(data.email);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async sendResetLink(email: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Enviando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await sendPasswordResetEmail(this.auth, email);
      
      const toast = await this.toastCtrl.create({
        message: 'E-mail enviado! Verifique sua caixa de entrada.',
        duration: 4000,
        color: 'success',
        position: 'top'
      });
      toast.present();

    } catch (error: any) {
      console.error('Erro na recuperação:', error);
      let msg = 'Erro ao enviar e-mail.';
      
      if (error.code === 'auth/user-not-found') {
        msg = 'E-mail não cadastrado.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'E-mail inválido.';
      }
      
      this.showErrorToast(msg);
    } finally {
      await loading.dismiss();
    }
  }

  private handleAuthError(error: any) {
    console.error('Erro no login:', error.code);
    let errorMessage = 'Ocorreu um erro. Tente novamente.';

    if (
      error.code === 'auth/invalid-email' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      errorMessage = 'E-mail ou senha inválidos.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
    }

    this.showErrorToast(errorMessage);
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    toast.present();
  }
}