
export interface NomadRegion {
  name: string;
  url: string;
}

export interface NomadPeriodic {
  Enabled: boolean;
  ProhibitOverlap: boolean;
  Spec: string;
  SpecType: string;
  TimeZone: string;
}

export interface NomadParameterizedJob {
  MetaOptional: string[] | null;
  MetaRequired: string[] | null;
  Payload: string;
}

export interface NomadJob {
  ID: string;
  Periodic: NomadPeriodic | null;
  ParameterizedJob: NomadParameterizedJob | null;
  Meta: { [key: string]: string } | null;
}

export interface MetadataField {
  key: string;
  value: string;
  required: boolean;
}

export interface NomadFormData {
  selectRegion: NomadRegion;
  selectJob: NomadJob;
  [key: string]: any; // metadata fields
}
