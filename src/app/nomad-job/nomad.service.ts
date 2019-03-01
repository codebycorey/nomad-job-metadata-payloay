import { Injectable } from '@angular/core';
import { NomadRegion, NomadJob, MetadataField, NomadFormData } from './nomad.model';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { REGIONS } from '../../../config';
import { Observable, of, combineLatest } from 'rxjs';

// @todo add documentation
@Injectable()
export class NomadService {

  public nomadJobs: any = null;
  public regions: NomadRegion[] = REGIONS;

  public nomadJobs$: Observable<NomadJob>;

  public constructor(
    private httpClient: HttpClient
  ) {}

  public loadNomadJobs(region$: Observable<NomadRegion>): Observable<NomadJob[]> {
    return region$.pipe(
      switchMap((region: NomadRegion) => {
        return (!region) ? of([]) : this.httpClient.get(`${region.url}/v1/jobs`).pipe(
          map((response: any[]) => response.filter((job) => (!job.ParentID && job.Type === 'batch' && job.Status === 'running')))
        );
      })
    );
  }

  public loadMetadata(region$: Observable<NomadRegion>, job$: Observable<NomadJob>): Observable<MetadataField[]> {
    return combineLatest(region$, job$).pipe(
      switchMap(([region, job]) => this.loadNomadJobDetails(region.url, job.ID)),
      switchMap((jobDetails: NomadJob) => this.buildMetadataFields(jobDetails))
    );
  }

  public loadNomadJobDetails(url: string, id: string): Observable<NomadJob> {
    return this.httpClient.get<NomadJob>(`${url}/v1/job/${id}`);
  }

  public runJob(formData: NomadFormData, metadataFields: MetadataField[]) {
    const region: NomadRegion = formData.selectRegion;
    const job: NomadJob = formData.selectJob;
    // @todo verifiy cron
    if (!job.Periodic) {
      return this.runCronJob(region.url, job.ID).subscribe();
    }
    const meta: any[] = []; // @todo type
    // @todo look into nomad api to make sure meta fields are mapped correctly.
    metadataFields.forEach((metadata: MetadataField, index: number) => {
      meta.push({
        index,
        id: metadata.key,
        value: metadata.value
      });
    });
    this.runParamJob(region.url, job.ID, meta).subscribe();
  }

  public runParamJob(url: string, id: string, metaFields: any) {
    return this.httpClient.post(`${url}/v1/job/${id}/dispatch`, { Payload: '', Meta: metaFields });
  }

  public runCronJob(url: string, id: string) {
    return this.httpClient.post(`${url}/v1/job/${id}/periodic/force`, {});
  }

  private buildMetadataFields(job: NomadJob): Observable<MetadataField[]> {
    const metadataFields: MetadataField[] = [];

    // @todo handle different fields types based on job
    if (!job.Periodic && job.ParameterizedJob) {
      if (job.ParameterizedJob.MetaRequired) {
        job.ParameterizedJob.MetaRequired.map((metaKey) => {
          const defaultValue = job.Meta ? job.Meta[metaKey] : null;
          metadataFields.push({ key: metaKey, value: defaultValue || '', required: true });
        });
      }
      if (job.ParameterizedJob.MetaOptional) {
        job.ParameterizedJob.MetaOptional.map((metaKey) => {
          const defaultValue = job.Meta ? job.Meta[metaKey] : null;
          metadataFields.push({ key: metaKey, value: defaultValue || '', required: false });
        });
      }
    }
    return of(metadataFields);
  }
}
