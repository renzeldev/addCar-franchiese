// Code behind logic for list of CountryListItem

// Initially powered by Stantum Angular Utils.
// Want to dramatically increase your development speed too? Visit https://www.stantum.cz/development-automation

import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";

import { PagerService } from "@app-shared/common/pager.service";
import { ListPageWrapper } from "@app-shared/common/list-page-wrapper.model";
import { NotificationService } from "@app-shared/services/notification.service";
import { SpinnerOverlayService } from "@app-shared/services/spinner-overlay.service";
import { CountryListItem } from '@app-shared/models/franchisee/country-list-item.model';
import { CountryService } from 'app/shared/services/financial/country.service';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AutocompleteHelper } from "app/shared/services/autocomplete.helper";
import { MatTableDataSource } from "@angular/material/table";
import { MessageCodes } from "../../../shared/models/system/message-codes";
import { Observable, forkJoin } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CountryAllowedReferenceModel, CountryViewModel } from "app/shared/models/financial/country-view.model";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ConfirmationModalComponent } from "app/layout/rates/rates-general/confirmation-modal/confirmation-modal.component";


@Component({
  selector: 'app-country-allowed-countries',
  templateUrl: './country-allowed-countries.component.html',
  styleUrls: ['./country-allowed-countries.component.css']
})

export class CountryAllowedCountriesComponent implements OnInit, OnChanges {

  @Input() countryDetailUid: string;
  pageWrapper: ListPageWrapper<CountryViewModel>;
  s: Array<CountryViewModel>;
  pager: any = {};
  submitted = false;
  countriesSource: CountryViewModel[];
  displayColumns: string[] = ['name', 'action'];
  dataSource = new MatTableDataSource<CountryViewModel>(null);
  public countryHelper: AutocompleteHelper<CountryViewModel>;
  public control = new FormControl("");
  public countries: CountryViewModel[]
  public allowedReferences: string[] = []
  public references: CountryAllowedReferenceModel[] = [];
  public filteredallowedReferences: Observable<string[]>;
  public allowedReferenceName: string = ""
  public dialogRef: any
  public isModalShow: boolean = false;

  constructor(private countryService: CountryService, private formBuilder: FormBuilder, private spinnerService: SpinnerOverlayService,
    private notificationService: NotificationService, private dialog: MatDialog) {
      this.countryHelper = new AutocompleteHelper<CountryViewModel>();
  }

  ngOnInit(): void {
    if(this.countryDetailUid) {
      forkJoin([
        this.countryService.getCountries("1", 999),
        this.countryService.getCountryAllowedReferecne(this.countryDetailUid)
      ]).subscribe(([countriesResponse, countryAllowedReferences]: [ListPageWrapper<CountryViewModel>, CountryAllowedReferenceModel[]]) => {
        this.countries = countriesResponse.items.filter(c => c.uid !== this.countryDetailUid);
        this.references = countryAllowedReferences;
        this.sortByReferenceName();
        this.countries.map((item) => {
          if(countryAllowedReferences.findIndex(c => c.countryReferenceUid === item.uid) < 0) {
            this.allowedReferences.push(item.code);
          }
        });
        this.filteredallowedReferences = this.control.valueChanges.pipe(
          startWith(""),
          map(value => this._filter(value || "")),
        );
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  addCountry(){
    if(this.allowedReferenceName) {
      let allowedReferenceInfo = this.countries.filter(c => c.code === this.allowedReferenceName)[0];
      this.countryService.addCountryAllowedReference(this.countryDetailUid, allowedReferenceInfo.uid).subscribe((res: any) => {
        let country = this.countries.find(c => c.code === this.allowedReferenceName).name;
        this.references = this.references.concat({ ...res, countryReferenceName: country });
        this.sortByReferenceName();
        this.allowedReferences = this.allowedReferences.filter(code => code !== this.allowedReferenceName);
        this.allowedReferenceName = "";
        this.filteredallowedReferences = this.control.valueChanges.pipe(
          startWith(""),
          map(value => this._filter(value || "")),
        );
      })
    }
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.allowedReferences.filter(reference => this._normalizeValue(reference).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  //Validate the control

  delete(referece) {
    this.dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        description: "Please confirm that you want to remove this promo?"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isModalShow = false;
      if (result.result === 1) {
        let formData = {
          data: [
            {
              uid: referece.uid, entityVersion:referece.entityVersion
            }
          ]
        }
        this.countryService.deleteCountryAllowedReference(formData).subscribe((res) => {
         this.notificationService.showSuccess(`The ${referece.countryReferenceName} was deleted successfully`);
         this.references = this.references.filter(c => c.uid !== referece.uid);
         this.allowedReferences = this.allowedReferences.concat(this.countries.find(r => r.name === referece.countryReferenceName).code);
         this.filteredallowedReferences = this.control.valueChanges.pipe(
          startWith(""),
          map(value => this._filter(value || "")),
        );
        });
      }
    })
  }


  gotoPage(pageNum: number) {
    this.pager.currentPage = pageNum;
    this.reloadList();
  }

  private reloadList() {
    //if () {
    //  this.s = [];
    //  this.pager = this.pagerService.getPager(0, 0, 5);
    //  return;
    //}
    //this.spinnerService.show();

    let pageNum = (this.pager.currentPage) ? this.pager.currentPage : 0;

    //  this.defaultService.loadAllowedCountries(, this.pager.currentPage).subscribe((: ListPageWrapper<CountryListItem>) => {
    //    this.pageWrapper = ;
    //    this.s = .items;
    //    this.pager = this.pagerService.getPager(.totalCount, .currentPage, .pageSize);
    //  //this.spinnerService.hide();
    //}, (err) => {
    //  //this.spinnerService.hide();
    //  throw err;
    //});
  }

  searchCategory(event: any): void {

  }

  sortByReferenceName() {
    this.references.sort((a, b) => {
      var nameA = a.countryReferenceName.toLowerCase();
      var nameB = b.countryReferenceName.toLowerCase();
      if(nameA < nameB) {
        return -1;
      }
      if(nameA > nameB) {
        return 1;
      }
      return 0;
    })
  }
}
