
import { BaseEntity } from "./../base-entity.model";


export class LocationListItem extends BaseEntity {
  public name: string = "";
  public country: string = "";
  public city: string = "";
  public email: string = "";
  public phone: string = "";
  public isGrouped: boolean = true;
}

export class IncludedLocation {
  uid: string;
  entityVersion: string;
  rateUid: string;
  locationUid: string;
  locationCode: string;
  locationName: string;
}

export class LocationType {
  id: number;
  name: string;
}
