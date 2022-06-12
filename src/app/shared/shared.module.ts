import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';

import { PresetFilterComponent } from './components/preset-filter/preset-filter.component';

import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { ModalComponent } from './components/modal-dialog/modal-dialog.component';

import 'hammerjs';

@NgModule({
    imports: [
        FormsModule,
        RouterModule,
        LayoutModule,
        ButtonsModule,
        DropDownsModule,
        InputsModule,
        GridModule,
        ChartsModule,
        SchedulerModule
    ],
    exports: [
        FormsModule,
        MainMenuComponent,
        SideMenuComponent,
        PresetFilterComponent,
	ModalComponent,
        LayoutModule,
        ButtonsModule,
        DropDownsModule,
        InputsModule,
        GridModule,
        ChartsModule,
        SchedulerModule
    ],
    declarations: [
        MainMenuComponent,
        SideMenuComponent,
        PresetFilterComponent,
        ModalComponent,
    ],
    providers: [],
})
export class SharedModule { }
