import { Component, OnInit, OnDestroy } from '@angular/core';

import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { FilteredIssues } from '../../repositories/dashboard.repository';
import { Store } from 'src/app/core/state/app-store';
import { StatusCounts } from '../../models';
import { DashboardFilter } from 'src/app/shared/models/dto/stats/dashboard-filter';

import { PtUserService } from 'src/app/core/services';
import { PtUser } from 'src/app/core/models/domain';

interface DateRange {
    dateStart: Date;
    dateEnd: Date;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: 'dashboard.page.component.html',
    styleUrls: ['dashboard.page.component.css']
})
export class DashboardPageComponent implements OnInit, OnDestroy {

    private statusCountSub: Subscription | undefined;
    private issuesSub: Subscription | undefined;
    public filter: DashboardFilter = {};
    public filteredDateStart: Date | undefined;
    public filteredDateEnd: Date | undefined;

    public statusCounts$: BehaviorSubject<StatusCounts> = new BehaviorSubject<StatusCounts>({
        activeItemsCount: 0,
        closeRate: 0,
        closedItemsCount: 0,
        openItemsCount: 0
    });

    public users$: Observable<PtUser[]> = this.store.select<PtUser[]>('users');
    public issuesAll$: BehaviorSubject<FilteredIssues> = new BehaviorSubject<FilteredIssues>({
        categories: [],
        items: []
    });

    public categories: Date[] = [];
    public itemsOpenByMonth: number[] = [];
    public itemsClosedByMonth: number[] = [];

    private get currentUserId() {
        if (this.store.value.currentUser) {
            return this.store.value.currentUser.id;
        } else {
            return undefined;
        }
    }

    constructor(
        private dashboardService: DashboardService,
        private userService: PtUserService,
        private store: Store
    ) { }

    public ngOnInit() {
        this.issuesAll$.subscribe((issues: FilteredIssues) => {
            this.categories = issues.categories.map(c => new Date(c));

            this.itemsOpenByMonth = [];
            this.itemsClosedByMonth = [];
            issues.items.forEach((item, index) => {
                this.itemsOpenByMonth.push(item.open.length);
                this.itemsClosedByMonth.push(item.closed.length);
            });
        });
        this.refresh();
    }

    public userFilterOpen() {
        this.userService.fetchUsers();
    }

    public userFilterValueChange(user: PtUser | undefined) {
        if (user) {
            this.filter.userId = user.id;
        } else {
            this.filter.userId = undefined;
        }
        this.refresh();
    }

    public onMonthRangeTap(months: number) {
        const range = this.getDateRange(months);
        this.filteredDateStart = range.dateStart;
        this.filteredDateEnd = range.dateEnd;
        this.filter = {
            userId: this.filter.userId,
            dateEnd: range.dateEnd,
            dateStart: range.dateStart
        };
        this.refresh();
    }

    private refresh() {
        this.statusCountSub = this.dashboardService.getStatusCounts(this.filter)
            .subscribe(result => {
                this.statusCounts$.next(result);
            });

        this.issuesSub = this.dashboardService.getFilteredIssues(this.filter)
            .subscribe((result: FilteredIssues) => {
                this.issuesAll$.next(result);
            });
    }


    private getDateRange(months: number): DateRange {
        const now = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        return {
            dateStart: start,
            dateEnd: now
        };
    }

    public ngOnDestroy() {
        if (this.statusCountSub) {
            this.statusCountSub.unsubscribe();
        }
        if (this.issuesSub) {
            this.issuesSub.unsubscribe();
        }
    }
}
