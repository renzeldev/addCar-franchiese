import { BaseEntity } from './base-entity.model';

export class BrokerListItem extends BaseEntity {
  public name: string;
  public vatNumber: string;
  public jimpiClientId: number | null;
  public email: string;
  public amountToInvoice: number | null;
  public isMultipleCurrencies = false;
}

export class BrokerItem {
  public uid: string;
  public entityVersion: string;
  public name: string
  public code: string
  public countryUid: string;
}

export class RateBrokerItem {
  uid: string
  entityVersion: string
  rateUid: string
  brokerUid: string
  brokerName: string
}
