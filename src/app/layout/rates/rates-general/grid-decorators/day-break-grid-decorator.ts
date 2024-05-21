import { GridBase } from "app/shared/components/editable-grid/grid-base";
import { GridDecoratorBase } from "app/shared/components/editable-grid/grid-decorator-base";
import { RatesService } from "app/shared/services/rates/rates.service";

export class DayBreakGridDecorator extends GridDecoratorBase {

  constructor(private rateService: RatesService) {
    super();
  }
  selectedDaybreak: any
  changedDaybreakUid: any
  editingRow: boolean = false;
  buildGrid(grid: GridBase) {

    grid.onRowSelected = async (e) => {
      if (e.type === "rowSelected")
        this.selectedDaybreak = e.data;
    }
    grid.onCellKeyDown = async (e) => {
      if (e.event.key === "Enter") {
        let vehicle = e.colDef.field.split("_")[0];
        this.changedDaybreakUid = e.data[vehicle + "_Uid"];
        this.rateService.getRateSeasonValue(this.changedDaybreakUid).subscribe((data: any) => {
          let updatedData = {
            uid: data.uid,
            entityVersion: data.entityVersion,
            value: data.value,
            freeMiles: {
              price: e.data[vehicle + "_Value"],
              isUnlimited: e.data[vehicle + "_IsUnlimited"],
              isResetDaily: e.data[vehicle + "_Free"],
              distanceIncluded: e.data[vehicle + "_No"]
            }
          }
          this.rateService.updateRateSeasonValue(updatedData).subscribe();

        })
      }
    }

    grid.onRowEditingStarted = (e: any) => {
      this.editingRow = true;
      // this.rateService.sendGridChangedSubject({ type: 'daybreak', rowEditing: true, rowIndex: e.rowIndex, data: e.data });
    }

    grid.onRowEditingStopped = (e: any) => {
      this.editingRow = false;
      this.rateService.sendGridChangedSubject({ type: 'daybreak', rowEditing: false, rowIndex: e.rowIndex, data: e.data });
      // this.ratesService.sendGridChangedSubject({ type: 'season', data: e.data, action: 'new', rowIndex: e.rowIndex });
    }

    grid.onCellKeyDown = (e: any) => {

    }
    grid.defaultColDef = { resizable: true };
    grid.addHotKey({ key: "Ctrl + Shift + C", func: grid.clone });
  }
}
