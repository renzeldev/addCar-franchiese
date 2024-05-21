import { BaseEntity } from "../base-entity.model";

export class CurrencyViewModel extends BaseEntity {
  public exchangeRate: number;
  public unitName: string;
  public decimalName: string;
  public name: string;
}

