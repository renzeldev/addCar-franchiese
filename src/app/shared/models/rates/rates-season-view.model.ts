
export class RatesSeasonListModel {

    public uid: string;
    public rateUid: string;
    public description: string;
    public startDate: string;
    public endDate: string;
    public bookingStartDate: string;
    public bookingEndDate: string;
    public minRate: string;
    public maxRate: string;
    public minPeriod: string;
    public maxDiscount: string;
}

export class RateSeasonCreateModel {
    public description: string;
    public startDate: string;
    public endDate: string;
    public bookingStartDate: string;
    public bookingEndDate: string;
    public rateMin : number
    public rateMax: number
    public periodMin: number
    public discountMax: number
    public updated?: boolean
    constructor() {
        this.description = '';
        this.startDate = null;
        this.endDate = null;
        this.bookingStartDate = null;
        this.bookingEndDate = null;
        this.rateMin = 0;
        this.rateMax = 0;
        this.periodMin = 0;
        this.discountMax = 0;
        this.updated = true;
    }
}

export class RateSeasonDetailsModel{
    public uid : string
    public rateUid : string
    public description : string
    public startDate : string
    public endDate : string
    public bookingStartDate : string
    public bookingEndDate : string
    public entityVersion : string
    public rateMin : string
    public rateMax: string
    public periodMin: string
    public discountMax: string
    constructor({uid, rateUid, description, startDate, endDate, bookingStartDate, bookingEndDate, rateMin, rateMax, periodMin, discountMax, entityVersion}) {
        this.uid = uid;
        this.rateUid = rateUid;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.bookingStartDate = bookingStartDate;
        this.bookingEndDate = bookingEndDate;
        this.rateMin = rateMin;
        this.rateMax = rateMax;
        this.periodMin = periodMin;
        this.discountMax = discountMax;
        this.entityVersion  = entityVersion;
    }
}

export class RateSeasonDayBreakDetailsModel {
    public uid:	string
    public entityVersion: string
    public rateSeasonUid?: string
    public periodDaysFrom: number
    public periodDaysTo: number
}

export class RateSeasonExcessListModel {
    public uid:	string
    public entityVersion: string
    public seasonUid: string
    public excessUid: string
    public code: string
}

export class RateSeasonExtrasListModel{
    public uid: string
    public entityVersion: string
    public seasonUid: string
    public extrasUid: string
    public code?: string
    public originalCode?: string
}

export class RateSeasonExtrasValueDetailsModel{
    public uid: string	
    public entityVersion: string
    public rateSeasonUid: string
    public extrasUid: string
    public vehicleCategoryUid: string
    public value: number
    public isIncluded: boolean
    public isRequired: boolean
    public hasInvoiceVoucher: boolean
    public isValueChangeAllowed: boolean
    public isAvailable: boolean
    public isBreakdown: boolean
}

export class RateSeasonExcessValueDetailsModel{
    public uid: string
    public entityVersion: string
    public excessUid: string
    public seasonUid: string
    public vehicleCategoryUid?: string
    public value: number
}

export class RateSeasonValueDetailsModel{
    public uid: string
    public entityVersion: string
    public vehicleCategoryUid: string
    public rateDayBreakUid: string
    public rateSeasonUid: string
    public value: string
    public freeMiles:	RateSeasonValueFreeMilesModel
}

export class RateSeasonValueFreeMilesModel{
    public price: number
    public isUnlimited: boolean
    public isResetDaily: boolean
    public distanceIncluded: number
}

export class RateSeasonValueUpdateModel {
    public uid: string
    public entityVersion: string
    public value: string
    public freeMiles:	RateSeasonValueFreeMilesModel
    constructor(data: any) {
        this.uid = data.uid;
        this.entityVersion = data.entityVersion;
        this.value = data.value;
        this.freeMiles = data.freeMiles;
    }
}
