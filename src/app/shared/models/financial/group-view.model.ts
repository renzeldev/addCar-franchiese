import { BaseEntity } from "../base-entity.model";

export class GroupViewModel extends BaseEntity {
  description: string
  excessWithCDW: number
  excessWithoutCDW: number
  excessWithSCDW: number
  excessWithoutTheftInsurance: number
  excessTheft: number
  deposit: number
  details: string
  referenceSegment: number
  referenceVersion: string
  imageUrl: string
  minimumAge: number
  seniorAge: number
  minimumLicenseTime: number
  ageBreak: {
    begin: number
    beginIsExcluded: true
    end: number
    endIsExcluded: true
  }
}
