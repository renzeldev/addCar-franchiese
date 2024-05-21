import { BaseEntity } from "../base-entity.model";

export class LocationViewModel extends BaseEntity {
  public uid?: string;
  public countryUid: string;
  public code: string;
  public name: string;
  public description: string;
  public type?: number;
  public address: {
    address: string;
    city: string;
    zipCode: string;
    latitude?: number;
    longitude?: number
  };
  public monday?: {
    open: string;
    close: string;
    isWeekend: boolean;
  };
  public tuesday?: {
    open: string;
    close: string;
    isWeekend: boolean;
  };
  public wednesday?: {
    open: string;
    close: string;
    isWeekend: boolean;
  };
  public thursday?: {
    open: string;
    close: string;
    isWeekend: boolean;
  };
  public friday?: {
    open: string;
    close: string;
    isWeekend: boolean;
  };
  public saturday?: {
    open: string;
    close: string;
    isWeekend: boolean;
  };
  public sunday?: {
    open: string;
    close: string;
    isWeekend: boolean;
  };
  public timezone?: number;
  public email?: string;
  public phone?: {
    regular?: string;
    mobile?: string;
    fax?: string;
  };
}