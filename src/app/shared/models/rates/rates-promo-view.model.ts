export class RatesPromoDetailModel {
    uid: string;
    entityVersion: string;
    countryUid: string;
    brokerUid: string;
    vehicleCategoryUid: string;
    pickupPeriod: {
        begin: string,
        beginIsExcluded: boolean,
        end: string,
        endIsExcluded: boolean
    };
    bookingPeriod: {
        begin: string,
        beginIsExcluded: boolean,
        end: string,
        endIsExcluded: boolean
    };
    blackoutPeriod: {
        begin: string,
        beginIsExcluded: boolean,
        end: string,
        endIsExcluded: boolean
    };
    discount: 0
}

export class RatesPromoViewModel {
    public country: string;
    public broker: string;
    public vehicleCategory: string;
    public pickupStart: string;
    public pickupEnd: string;
    public bookingStart: string;
    public bookingEnd: string;
    public blackoutStart: string;
    public blackoutEnd: string;
    public discount: number;
    constructor(data) {
        this.country = data.country;
        this.broker = data.broker;
        this.vehicleCategory = data.vehicleCategory;
        this.pickupStart = data.pickupPeriod.begin;
        this.pickupEnd = data.pickupPeriod.end;
        this.bookingStart = data.bookingPeriod.begin;
        this.bookingEnd = data.bookingPeriod.end;
        this.blackoutStart = data.blackoutPeriod.begin;
        this.blackoutEnd = data.blackoutPeriod.end;
        this.discount = data.discount;
    }
}

export class RatesPromoCreateModel {
    public countryUid: string;
    public brokerUid: string;
    public vehicleCategoryUid: string;
    public pickupPeriod: any;
    public bookingPeriod: any;
    public blackoutPeriod: any;
    public discount: number;
    constructor(data) {
        this.countryUid = data.countryUid;
        this.brokerUid = data.brokerUid;
        this.vehicleCategoryUid = data.vehicleCategoryUid;
        this.discount = data.discount;
        this.pickupPeriod = {
            begin: data.pickupStart,
            beginIsExcluded: true,
            end: data.pickupEnd,
            endIsExcluded: true
        };
        this.bookingPeriod = {
            begin: data.bookingStart,
            beginIsExcluded: true,
            end: data.bookingEnd,
            endIsExcluded: true
        };
        this.blackoutPeriod = {
            begin: data.blackoutStart,
            beginIsExcluded: true,
            end: data.blackoutEnd,
            endIsExcluded: true
        };
    }
}
