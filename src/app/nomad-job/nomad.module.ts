import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NomadComponent } from './nomad.component';
import { CommonModule } from '@angular/common';
import { NomadService } from './nomad.service';
import { AppMaterialModule } from '../app-material.module';

@NgModule({
  declarations: [
    NomadComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,

    AppMaterialModule
  ],
  exports: [
    NomadComponent
  ],
  providers: [
    NomadService
  ]
})
export class NomadModule {}
