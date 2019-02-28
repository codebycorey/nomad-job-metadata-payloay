import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NomadComponent } from './nomad.component';
import { CommonModule } from '@angular/common';
import { NomadService } from './nomad.service';

@NgModule({
  declarations: [
    NomadComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  exports: [
    NomadComponent
  ],
  providers: [
    NomadService
  ]
})
export class NomadModule {}
