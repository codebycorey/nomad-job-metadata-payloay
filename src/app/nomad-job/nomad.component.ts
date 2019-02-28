import { Component, OnInit } from '@angular/core';
import { NomadService } from './nomad.service';
import { NomadRegion } from './nomad.model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-nomad',
  templateUrl: './nomad.component.html'

})
export class NomadComponent implements OnInit {

  public regions: NomadRegion[];
  public nomadForm: FormGroup;
  public nomadJobs: any;
  public metadataFields: any[];

  private selectedRegion: NomadRegion;
  private selectedJob: any;

  public constructor(
    private formBuilder: FormBuilder,
    private nomadService: NomadService
  ) {}

  /**
   * @todo convert this to better use of obersvables and reactive forms.
   * just wanted to get it in a working state
   */
  public ngOnInit(): void {
    this.regions = this.nomadService.regions;

    this.nomadForm = this.formBuilder.group({
      regionSelect: ['', Validators.required],
      jobSelect: ['', Validators.required]
    });

    this.nomadForm.get('regionSelect').valueChanges.subscribe((region) => {
      this.selectedRegion = region;
      this.nomadService.loadNomadJobs(this.selectedRegion.url).subscribe((response) => {
        this.nomadJobs = response;
        if (response.length > 0) {
          this.nomadForm.get('jobSelect').patchValue(response[0]);
        }
      },
        () => this.nomadJobs = null // @todo handle errors
      );
    });

    this.nomadForm.get('jobSelect').valueChanges.subscribe((job) => {
      this.selectedJob = job;
      this.nomadService.loadNomadJob(this.selectedRegion.url, this.selectedJob.ID)
        .subscribe((jobDetail: any) => {
          this.metadataFields = [];
          const isCron: boolean = !!jobDetail.Periodic;

          if (!isCron && jobDetail.ParameterizedJob) {
            if (jobDetail.ParameterizedJob.MetaRequired) {
              jobDetail.ParameterizedJob.MetaRequired.map((metaKey) => {
                const defaultValue = jobDetail.Meta ? jobDetail.Meta[metaKey] : null;
                this.metadataFields.push({ key: metaKey, value: defaultValue || '', required: true });
              });
            }
            if (jobDetail.ParameterizedJob.MetaOptional) {
              jobDetail.ParameterizedJob.MetaOptional.map((metaKey) => {
                const defaultValue = jobDetail.Meta ? jobDetail.Meta[metaKey] : null;
                this.metadataFields.push({ key: metaKey, value: defaultValue || '', required: false });
              });
            }

            this.metadataFields.forEach((metadata) => {
              let newControl: FormControl;
              if (metadata.required) {
                newControl = this.formBuilder.control(metadata.value, Validators.required);
              } else {
                newControl = this.formBuilder.control(metadata.value);
              }
              this.nomadForm.addControl(metadata.key, newControl);
            });
          }
        });
    });

    this.nomadForm.get('regionSelect').patchValue(this.regions[0]);
  }

  public onSubmit(): any {
    const formValue = this.nomadForm.getRawValue();
    if (!!this.selectedJob.Periodic) {
      return this.nomadService.runCronJob(this.selectedRegion.url, this.selectedJob.ID).subscribe();
    }
    if (this.metadataFields.length > 0) {
      const apiMetaField: any[] = [];
      this.metadataFields.forEach((meta, index) => {
        apiMetaField.push({
          index,
          id: meta.key,
          value: formValue[meta.key]
        });
      });
      return this.nomadService.runParamJob(this.selectedRegion.url, this.selectedJob.ID, apiMetaField).subscribe();
    }
  }
}
