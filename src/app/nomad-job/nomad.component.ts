import { Component, OnInit } from '@angular/core';
import { NomadService } from './nomad.service';
import { NomadRegion, NomadJob, MetadataField, NomadFormData } from './nomad.model';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// @todo add documentation
@Component({
  selector: 'app-nomad',
  templateUrl: './nomad.component.html'

})
export class NomadComponent implements OnInit {

  public regions: NomadRegion[];
  public nomadForm: FormGroup = this.formBuilder.group({
    regionSelect: ['', Validators.required],
    jobSelect: ['', Validators.required]
  });

  public nomadJobs$: Observable<NomadJob[]>;
  public nomadMetadata$: Observable<MetadataField[]>;

  private metadataFields: MetadataField[] = [];

  public constructor(
    private formBuilder: FormBuilder,
    private nomadService: NomadService
  ) {}

  public ngOnInit(): void {
    this.regions = this.nomadService.regions;

    const region$: Observable<NomadRegion> = this.nomadForm.get('regionSelect').valueChanges;
    const job$: Observable<NomadJob> = this.nomadForm.get('jobSelect').valueChanges;

    this.nomadJobs$ = this.nomadService.loadNomadJobs(region$);
    this.nomadMetadata$ = this.nomadService.loadMetadata(region$, job$)
      .pipe(
        tap(() => this.clearMetadataFormControls()),
        tap((metadataFields: MetadataField[]) => {
          if (metadataFields.length > 0) {
            this.buildMetadataFormControls(metadataFields);
          }
        })
      );
  }

  public onSubmit(): any {
    const formValue: NomadFormData = this.nomadForm.getRawValue();
    this.nomadService.runJob(formValue, this.metadataFields);
  }

  private buildMetadataFormControls(metadataFields: MetadataField[]) {
    metadataFields.forEach((metadata) => {
      let newControl: FormControl;
      if (metadata.required) {
        newControl = this.formBuilder.control(metadata.value, Validators.required);
      } else {
        newControl = this.formBuilder.control(metadata.value);
      }
      this.nomadForm.addControl(metadata.key, newControl);
    });
    this.metadataFields = metadataFields;
  }

  private clearMetadataFormControls() {
    this.metadataFields.forEach((metadata: MetadataField) => this.nomadForm.removeControl(metadata.key));
    this.metadataFields = [];
  }
}
