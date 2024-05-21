import { BaseEntity } from "../base-entity.model";


export class GroupListItem extends BaseEntity {
  public group: string;
  public description: string;
  public minimumAge: string;
  public maximumAge?: string;
  public seniorAge: string
}
