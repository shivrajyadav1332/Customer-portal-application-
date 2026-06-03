import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, tap, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import {
    GateSignal,
    BarrierStatus,
    WeighbridgeData,
    CurrentVehicle,
    LEDMessage,
    CameraStatus,
    CameraList
} from '../models/smart-gate.model';
import {
    MOCK_GATE_SIGNALS,
    MOCK_BARRIER_STATUS,
    MOCK_WEIGHBRIDGE_DATA,
    MOCK_CURRENT_VEHICLE,
    MOCK_LED_MESSAGE,
    MOCK_CAMERAS
} from '../models/smart-gate.mock';

@Injectable({
    providedIn: 'root'
})
export class GateMonitorService {
    private http = inject(HttpClient);
    private apiUrl = '/api/gate';

    // Observable data subjects
    private gateSignalSubject = new BehaviorSubject<GateSignal | null>(null);
    private barrierStatusSubject = new BehaviorSubject<BarrierStatus | null>(null);
    private weighbridgeSubject = new BehaviorSubject<WeighbridgeData | null>(null);
    private currentVehicleSubject = new BehaviorSubject<CurrentVehicle | null>(null);
    private ledMessageSubject = new BehaviorSubject<LEDMessage | null>(null);
    private camerasSubject = new BehaviorSubject<CameraStatus[]>([]);

    // Public observables for components
    gateSignal$ = this.gateSignalSubject.asObservable();
    barrierStatus$ = this.barrierStatusSubject.asObservable();
    weighbridge$ = this.weighbridgeSubject.asObservable();
    currentVehicle$ = this.currentVehicleSubject.asObservable();
    ledMessage$ = this.ledMessageSubject.asObservable();
    cameras$ = this.camerasSubject.asObservable();

    // Real-time polling intervals
    private pollGateSignals() {
        return interval(2000).pipe(
            switchMap(() => this.getGateSignals()),
            tap(data => this.gateSignalSubject.next(data)),
            catchError(error => {
                console.error('Error polling gate signals:', error);
                return of(null);
            })
        );
    }

    private pollBarrierStatus() {
        return interval(2000).pipe(
            switchMap(() => this.getBarrierStatus()),
            tap(data => this.barrierStatusSubject.next(data)),
            catchError(error => {
                console.error('Error polling barrier status:', error);
                return of(null);
            })
        );
    }

    private pollWeighbridge() {
        return interval(1000).pipe(
            switchMap(() => this.getWeighbridgeData()),
            tap(data => this.weighbridgeSubject.next(data)),
            catchError(error => {
                console.error('Error polling weighbridge:', error);
                return of(null);
            })
        );
    }

    private pollCurrentVehicle() {
        return interval(2000).pipe(
            switchMap(() => this.getCurrentVehicle()),
            tap(data => this.currentVehicleSubject.next(data)),
            catchError(error => {
                console.error('Error polling current vehicle:', error);
                return of(null);
            })
        );
    }

    private pollLEDMessage() {
        return interval(3000).pipe(
            switchMap(() => this.getLEDMessage()),
            tap(data => this.ledMessageSubject.next(data)),
            catchError(error => {
                console.error('Error polling LED message:', error);
                return of(null);
            })
        );
    }

    private pollCameras() {
        return interval(5000).pipe(
            switchMap(() => this.getCameras()),
            tap(data => this.camerasSubject.next(data.cameras)),
            catchError(error => {
                console.error('Error polling cameras:', error);
                return of({ cameras: [] });
            })
        );
    }

    // Start all real-time polling
    startRealTimeMonitoring() {
        this.pollGateSignals().subscribe();
        this.pollBarrierStatus().subscribe();
        this.pollWeighbridge().subscribe();
        this.pollCurrentVehicle().subscribe();
        this.pollLEDMessage().subscribe();
        this.pollCameras().subscribe();
    }

    // API Methods
    getGateSignals(): Observable<GateSignal> {
        return this.http.get<GateSignal>(`${this.apiUrl}/signals`);
    }

    getBarrierStatus(): Observable<BarrierStatus> {
        return this.http.get<BarrierStatus>(`${this.apiUrl}/barriers`);
    }

    getWeighbridgeData(): Observable<WeighbridgeData> {
        return this.http.get<WeighbridgeData>(`${this.apiUrl}/weighbridge/current`);
    }

    getCurrentVehicle(): Observable<CurrentVehicle> {
        return this.http.get<CurrentVehicle>(`${this.apiUrl}/current-vehicle`);
    }

    getLEDMessage(): Observable<LEDMessage> {
        return this.http.get<LEDMessage>(`${this.apiUrl}/led-message`);
    }

    getCameras(): Observable<CameraList> {
        return this.http.get<CameraList>(`${this.apiUrl}/cameras`);
    }

    // Control Methods
    openEntryBarrier(): Observable<BarrierStatus> {
        return this.http.post<BarrierStatus>(`${this.apiUrl}/barriers/entry/open`, {});
    }

    closeEntryBarrier(): Observable<BarrierStatus> {
        return this.http.post<BarrierStatus>(`${this.apiUrl}/barriers/entry/close`, {});
    }

    openExitBarrier(): Observable<BarrierStatus> {
        return this.http.post<BarrierStatus>(`${this.apiUrl}/barriers/exit/open`, {});
    }

    closeExitBarrier(): Observable<BarrierStatus> {
        return this.http.post<BarrierStatus>(`${this.apiUrl}/barriers/exit/close`, {});
    }

    updateLEDMessage(message: string): Observable<LEDMessage> {
        return this.http.post<LEDMessage>(`${this.apiUrl}/led-message`, { message });
    }

    captureSnapshot(cameraId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/cameras/${cameraId}/snapshot`, {});
    }

    getCameraSnapshot(cameraId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/cameras/${cameraId}/snapshot`, { responseType: 'blob' });
    }
}
