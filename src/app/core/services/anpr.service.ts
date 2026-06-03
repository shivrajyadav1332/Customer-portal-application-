import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ANPRDetection, ANPRLatest } from '../models/smart-gate.model';

@Injectable({
    providedIn: 'root'
})
export class ANPRService {
    private http = inject(HttpClient);
    private apiUrl = '/api/anpr';

    private latestDetectionSubject = new BehaviorSubject<ANPRDetection | null>(null);
    private detectionHistorySubject = new BehaviorSubject<ANPRDetection[]>([]);

    latestDetection$ = this.latestDetectionSubject.asObservable();
    detectionHistory$ = this.detectionHistorySubject.asObservable();

    private pollLatestDetection() {
        return interval(3000).pipe(
            switchMap(() => this.getLatestDetection()),
            tap(data => {
                if (data.latest) {
                    this.latestDetectionSubject.next(data.latest);
                    this.detectionHistorySubject.next(data.detectionHistory);
                }
            }),
            catchError(error => {
                console.error('Error polling ANPR detections:', error);
                return of({ latest: null, detectionHistory: [] });
            })
        );
    }

    startMonitoring() {
        this.pollLatestDetection().subscribe();
    }

    getLatestDetection(): Observable<ANPRLatest> {
        return this.http.get<ANPRLatest>(`${this.apiUrl}/latest`);
    }

    getDetectionHistory(limit: number = 20): Observable<ANPRDetection[]> {
        return this.http.get<ANPRDetection[]>(`${this.apiUrl}/history?limit=${limit}`);
    }

    searchByPlate(licensePlate: string): Observable<ANPRDetection[]> {
        return this.http.get<ANPRDetection[]>(`${this.apiUrl}/search?plate=${licensePlate}`);
    }

    getDetectionsForDateRange(startDate: string, endDate: string): Observable<ANPRDetection[]> {
        return this.http.get<ANPRDetection[]>(`${this.apiUrl}/range?start=${startDate}&end=${endDate}`);
    }
}
