import { BaseEntity } from "../base-entity.model";

export class CountryViewModel extends BaseEntity {
  public iso: string;
  public name: string;
  public numericIso: number;
  public phoneCode: string;
  public settings: {
    isPublicSiteVisible: boolean,
    isHiddenInList: boolean,
    missingFuelCharge: number,
    penalty: number,
    refuelCharge: number,
    tax: number,
    rateMin: number,
    rateMax: number,
    discountMax: number
  } = {
    isPublicSiteVisible: false,
    isHiddenInList: false,
    missingFuelCharge: 0,
    penalty: 0,
    refuelCharge: 0,
    tax: 0,
    rateMin: 0,
    rateMax: 0,
    discountMax: 0
}
}

export class CountryAllowedReferenceModel {
  public uid: string;
  public entityVersion: string;
  public countryUid: string;
  public countryReferenceUid: string;
  public countryReferenceName: string;
}

export class CountryVehicleCategorySetting {
  uid: string;
  entityVersion: string;
  countryUid: string;
  vehicleCategoryUid: string;
  modelName: string;
  isGuaranteedModel: boolean;
  guaranteedYear: number
  maxMileage: number
  fuelPolicy: number
  doors: number
  passengers: number
  minDriverAge: number
  maxDriverAge: number
  isFourWheelDrive: boolean;
  requiredDeposit: number
}
