export abstract class BaseRateModel {
    code?: string
    description: string
    uid: string; 
    
    // rateMin: number
    // rateMax: number
    // periodMin: number
    // discountMax: number
}

export class RateCreateModel extends BaseRateModel{
   public countryUid: string
   public currencyUid: string
   public isActive: boolean
}

export class RateDetailsModel extends BaseRateModel {
    public countryUid: string
    public rateCodeUid: string
    public currencyUid: string
    public isActive: boolean
    public entityVersion: string
}

export class RateUpdateModel extends BaseRateModel {
    public entityVersion: string
}

export class RateListModel extends BaseRateModel {
    // public uid: string;
    public entityVersion: string
}

