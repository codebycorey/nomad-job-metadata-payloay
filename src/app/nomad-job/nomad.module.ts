import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NomadComponent } from './nomad.component';
import { CommonModule } from '@angular/common';
import { NomadService } from './nomad.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    NomadComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [
    NomadComponent
  ],
  providers: [
    NomadService
  ]
})
export class NomadModule {}
