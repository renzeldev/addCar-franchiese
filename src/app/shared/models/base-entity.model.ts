export abstract class BaseEntity {
  uid?: string;
  entityVersion?: string;
  code: string;
}

export abstract class ExtraBaseEntity {
  code : string
  description : string
  isIncluded : boolean;
  isRequired : boolean;
  hasInvoiceVoucher : boolean;
  isValueChangeAllowed : boolean;
  isAvailable : boolean;
  isBreakdown : boolean;
}

