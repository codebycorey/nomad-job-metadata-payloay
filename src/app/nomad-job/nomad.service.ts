import { Injectable } from '@angular/core';
import { NomadRegion } from './nomad.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class NomadService {

  public nomadJobs: any = null;
  public regions: NomadRegion[] = [];

  public constructor(
    private httpClient: HttpClient
  ) {}

  public loadNomadJobs(url: string) {
    return this.httpClient.get(`${url}/v1/jobs`)
      .pipe(
        map((response: any[]) => response.filter((job) => (!job.ParentID && job.Type === 'batch' && job.Status === 'running')))
      );
  }

  public loadNomadJob(url: string, id: string) {
    return this.httpClient.get(`${url}/v1/job/${id}`);
  }

  public runParamJob(url: string, id: string, metaFields: any) {
    return this.httpClient.post(`${url}/v1/job/${id}/dispatch`, { Payload: '', Meta: metaFields });
  }

  public runCronJob(url: string, id: string) {
    return this.httpClient.post(`${url}/v1/job/${id}/periodic/force`, {});
  }
}
