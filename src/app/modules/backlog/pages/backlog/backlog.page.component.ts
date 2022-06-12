import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription, BehaviorSubject } from 'rxjs';

import { NavigationService } from 'src/app/core/services';
import { BacklogService } from '../../services/backlog.service';
import { PtItem } from 'src/app/core/models/domain';
import { PresetType } from 'src/app/core/models/domain/types';
import { PtNewItem } from 'src/app/shared/models/dto';
import { EMPTY_STRING } from 'src/app/core/helpers';
import { ItemType } from 'src/app/core/constants';
import { Store } from 'src/app/core/state/app-store';
import { ModalService } from 'src/app/shared/services/modal.service';
import { PageChangeEvent, GridDataResult, SelectableSettings, SelectionEvent } from '@progress/kendo-angular-grid';
import { PriorityEnum } from 'src/app/core/models/domain/enums';
import { SortDescriptor, orderBy, State, process } from '@progress/kendo-data-query';

@Component({
    selector: 'app-backlog',
    templateUrl: 'backlog.page.component.html',
    styleUrls: ['backlog.page.component.css']
})
export class BacklogPageComponent implements OnInit {

    private itemsSub: Subscription | undefined;
    public items$: BehaviorSubject<PtItem[]> = new BehaviorSubject<PtItem[]>([]);
    public currentPreset: PresetType = 'open';
    public gridData: GridDataResult | undefined;
    public pageSize = 10;
    public skip = 0;
    public sort: SortDescriptor[] = [{
        field: 'title',
        dir: 'asc'
    }];

    public gridState: State = {
        skip: 0,
        take: 10,
        sort: [],
        group: []
    };

    public checkboxOnly = false;
    public mode: any;
    public selectableSettings: SelectableSettings | undefined;

    public itemTypesProvider = ItemType.List.map((t) => t.PtItemType);
    public newItem: PtNewItem | undefined;

    public filter = {
        logic: 'and',
        filters: [{ field: 'title', operator: 'contains', value: 'Cross' }]
    };

    constructor(
        private activatedRoute: ActivatedRoute,
        private navigationService: NavigationService,
        private backlogService: BacklogService,
        private modalService: ModalService,
        private store: Store
    ) { }

    public ngOnInit() {

        this.selectableSettings = {
            checkboxOnly: this.checkboxOnly,
            // mode: this.mode
        };

        this.items$.subscribe((items: PtItem[]) => {
            this.gridData = process(items, this.gridState);
            /*
            this.gridData = {
                data: orderBy(items.slice(this.skip, this.skip + this.pageSize), this.sort),
                total: items.length
            };
            */
        });

        this.activatedRoute.params.subscribe(params => {
            if (this.itemsSub) {
                this.itemsSub.unsubscribe();
            }
            const reqPreset = params['preset'] as PresetType;
            if (reqPreset) {
                this.currentPreset = reqPreset;
                this.gridState.skip = 0;
                this.refresh();
            }
        });
        this.resetModalFields();
    }

    public onDataStateChange(newState: State) {
        this.gridState = newState;
        this.refresh();
    }

    private refresh() {
        this.itemsSub = this.backlogService.getItems(this.currentPreset)
            .subscribe((items: PtItem[]) => {
                this.items$.next(items);

            });
    }

    private resetModalFields() {
        this.newItem = {
            title: EMPTY_STRING,
            description: EMPTY_STRING,
            type: 'PBI'
        };
    }

    public getIndicatorImage(item: PtItem) {
        return ItemType.imageResFromType(item.type);
    }


    public getPriorityClass(item: PtItem): string {
        const indicatorClass = PriorityEnum.getIndicatorClass(item.priority);
        return indicatorClass;
    }

    public onPageChange(args: PageChangeEvent) {
        this.skip = args.skip;
        this.refresh();
    }

    public onSortChange(args: SortDescriptor[]) {
        this.sort = args;
        if (this.sort[0].field === 'assignee') {
            this.sort[0].field = 'assignee.fullName';
        }
        this.refresh();
    }



    public onSelectionChange(args: SelectionEvent) {
        if (args.selectedRows) {
            const selItem = args.selectedRows[0].dataItem as PtItem;
            this.navigationService.navigate(['/detail', selItem.id]);
        }
    }

    public selectListItem(item: PtItem) {
        // navigate to detail page
        this.navigationService.navigate(['/detail', item.id]);
    }

    public onAddTap(id: string) {
        this.openModal(id);
    }

    onSaveTap(newItem: PtNewItem, id: string) {
        if (typeof newItem === 'object') {
            if (this.store.value.currentUser) {
                this.backlogService.addNewPtItem(newItem, this.store.value.currentUser)
                    .then(nextItem => {
                        this.items$.next([nextItem, ...this.items$.value]);
                    });
            }
            this.closeModal(id);
        }
    }

    openModal(id: string) {
        this.modalService.open(id);
    }
    
    closeModal(id: string) {
        this.modalService.close(id);
        this.resetModalFields();
    }
}
