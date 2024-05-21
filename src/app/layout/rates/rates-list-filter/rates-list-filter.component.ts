import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListPageWrapper } from 'app/shared/common/list-page-wrapper.model';
import { CountryService } from 'app/shared/services/financial/country.service';
import { CurrencyService } from 'app/shared/services/financial/currency.service';

@Component({
  selector: 'app-rates-list-filter',
  templateUrl: './rates-list-filter.component.html',
  styleUrls: ['./rates-list-filter.component.css']
})
export class RatesListFilterComponent implements OnInit {

  formGroup: FormGroup;
  countries: any[];
  currencies: any[];

  @Output()
  onFilter = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private countryService: CountryService,
    private currencyService: CurrencyService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.countryService.getCountries("1", 999).subscribe((response: ListPageWrapper<any>) => {
      this.countries = response.items
    })
    this.currencyService.getCurrencies("1", 999).subscribe((response: ListPageWrapper<any>) => {
      this.currencies = response.items
    })
  }

  public createForm() {
    this.formGroup = this.formBuilder.group({
      countryUid: [""],
      currencyUid: [""],
      keywords:[""],
      isActive: false,
    });
  }

  filter() {
    let filterData = this.formGroup.value;
    this.onFilter.emit(filterData);
  }

}
