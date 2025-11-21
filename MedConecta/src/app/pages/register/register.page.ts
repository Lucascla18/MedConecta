import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  medkitOutline,
  logoGoogle,
  logoFacebook,
  logoApple,
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
export class RegisterPage {
  public formData = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  };
  public errorMessage: string | null = null;

  private router = inject(Router);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private loadingCtrl = inject(LoadingController);

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      closeCircleOutline,
      logoGoogle,
      logoFacebook,
      logoApple,
      medkitOutline,
    });
  }

  async handleRegister() {
    this.errorMessage = null;

    if (!this.validarCampos()) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      // Os dados já foram limpos pela função 'validarCampos'
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.formData.email,
        this.formData.senha
      );
      const uid = userCredential.user.uid;

      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, {
        nome: this.formData.nome, // O nome também está limpo
        email: this.formData.email,
        tipoUsuario: 'Paciente',
        dataCriacao: new Date().toISOString(),
      });

      console.log('Usuário registrado com sucesso!', uid);
      this.resetForm();
      this.router.navigate(['/login']);

    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      await loading.dismiss();
    }
  }

  private validarCampos(): boolean {
    // CORREÇÃO: Limpa os dados do formulário antes de validar
    this.formData.nome = this.formData.nome.trim();
    this.formData.email = this.formData.email.trim();
    this.formData.senha = this.formData.senha.trim();
    this.formData.confirmarSenha = this.formData.confirmarSenha.trim();

    const { nome, email, senha, confirmarSenha } = this.formData;

    if (!nome || !email || !senha || !confirmarSenha) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return false;
    }
    if (senha !== confirmarSenha) {
      this.errorMessage = 'As senhas não conferem.';
      return false;
    }
    if (senha.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return false;
    }
    return true;
  }

  private handleAuthError(error: any) {
    console.error('Erro no registro:', error.code);
    if (error.code === 'auth/email-already-in-use') {
      this.errorMessage = 'Este e-mail já está em uso.';
    } else if (error.code === 'auth/invalid-email') {
      this.errorMessage = 'O e-mail informado não é válido.';
    } else {
      this.errorMessage = 'Ocorreu um erro. Tente novamente.';
    }
  }

  private resetForm() {
    this.formData = {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    };
    this.errorMessage = null;
  }
}