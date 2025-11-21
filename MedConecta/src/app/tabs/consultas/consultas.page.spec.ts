import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultasPage } from './consultas.page';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('ConsultasPage', () => {
  let component: ConsultasPage;
  let fixture: ComponentFixture<ConsultasPage>;

  beforeEach(async () => {
    // Configura o ambiente de testes para um componente standalone
    await TestBed.configureTestingModule({
      imports: [
        ConsultasPage, // Importa o componente standalone
        IonicModule.forRoot(),
        RouterModule.forRoot([]), // Necessário para [routerLink]
        CommonModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});