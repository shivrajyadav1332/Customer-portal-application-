import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { GateActivity, RecentActivities } from '../models/smart-gate.model';

@Injectable({
    providedIn: 'root'
})
export class ActivityLogService {
    private http = inject(HttpClient);
    private apiUrl = '/api/logs';

    private recentActivitiesSubject = new BehaviorSubject<GateActivity[]>([]);
    recentActivities$ = this.recentActivitiesSubject.asObservable();

    private pollRecentActivities() {
        return interval(5000).pipe(
            switchMap(() => this.getRecentActivities()),
            tap(data => this.recentActivitiesSubject.next(data.activities)),
            catchError(error => {
                console.error('Error polling recent activities:', error);
                return of({ activities: [] });
            })
        );
    }

    startMonitoring() {
        this.pollRecentActivities().subscribe();
    }

    getRecentActivities(limit: number = 10): Observable<RecentActivities> {
        return this.http.get<RecentActivities>(`${this.apiUrl}/recent?limit=${limit}`);
    }

    getActivitiesByVehicle(vehicleNumber: string): Observable<GateActivity[]> {
        return this.http.get<GateActivity[]>(`${this.apiUrl}/vehicle/${vehicleNumber}`);
    }

    getActivitiesForDateRange(startDate: string, endDate: string): Observable<GateActivity[]> {
        return this.http.get<GateActivity[]>(`${this.apiUrl}/range?start=${startDate}&end=${endDate}`);
    }
}
