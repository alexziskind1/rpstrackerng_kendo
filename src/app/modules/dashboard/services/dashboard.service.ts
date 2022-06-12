import { Injectable, NgZone } from '@angular/core';

import { Observable } from 'rxjs';

import { DashboardRepository, FilteredIssues } from '../repositories/dashboard.repository';
import { TypeCounts, PriorityCounts, StatusCounts } from '../models';
import { DashboardFilter } from 'src/app/shared/models/dto/stats/dashboard-filter';

@Injectable()
export class DashboardService {

    constructor(
        private repo: DashboardRepository
    ) { }

    public getStatusCounts(filter: DashboardFilter): Observable<StatusCounts> {
        return this.repo.getStatusCounts(filter);
    }

    public getPriorityCounts(filter: DashboardFilter): Observable<PriorityCounts> {
        return this.repo.getPriorityCounts(filter);
    }

    public getTypeCounts(filter: DashboardFilter): Observable<TypeCounts> {
        return this.repo.getTypeCounts(filter);
    }

    public getFilteredIssues(filter: DashboardFilter): Observable<FilteredIssues> {
        return this.repo.getFilteredIssues(filter);
    }
}
