import { BaseEntity } from "../base-entity.model";


export class RatesExcessListItem extends BaseEntity {
  public code: string;
  public exchange_rate: string;
  public description: string;
  public unit: string;
  public decimal: string;
}
