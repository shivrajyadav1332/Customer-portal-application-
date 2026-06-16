import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScadaApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.scadaApiUrl;

  /**
   * 1. Vehicle Detected API: POST /api/vehicle/arrival
   * Fallback: POST /api/vehicle/arrive/{plate}
   */
  postVehicleArrival(plateNumber: string): Observable<any> {
    const payload = {
      plateNumber: plateNumber,
      arrivalTime: new Date().toISOString(),
      status: 'Vehicle Detected'
    };

    return this.http.post(`${this.baseUrl}/vehicle/arrival`, payload).pipe(
      catchError((err) => {
        console.warn('POST /api/vehicle/arrival failed, trying fallback /api/vehicle/arrive/{plate}', err);
        // Fallback to existing C# endpoint
        return this.http.post(`${this.baseUrl}/vehicle/arrive/${encodeURIComponent(plateNumber)}`, {});
      })
    );
  }

  /**
   * 3. Entry Barrier Open API: POST /api/barrier/entry/status
   * Fallback: POST /api/barrier/entry/open or /api/barrier/entry/close
   */
  postBarrierEntryStatus(status: 'Open' | 'Closed'): Observable<any> {
    const payload = {
      status: status,
      signal: status === 'Open' ? 'Green' : 'Red',
      timestamp: new Date().toISOString()
    };

    return this.http.post(`${this.baseUrl}/barrier/entry/status`, payload).pipe(
      catchError((err) => {
        console.warn('POST /api/barrier/entry/status failed, trying fallback /api/barrier/entry/[open|close]', err);
        const action = status === 'Open' ? 'open' : 'close';
        return this.http.post(`${this.baseUrl}/barrier/entry/${action}`, {});
      })
    );
  }

  /**
   * 4. Truck Entered Weighbridge API: POST /api/weighbridge/entry
   */
  postWeighbridgeEntry(plateNumber: string): Observable<any> {
    const payload = {
      plateNumber: plateNumber,
      location: 'Weighbridge',
      status: 'Truck On Weighbridge',
      timestamp: new Date().toISOString()
    };

    return this.http.post(`${this.baseUrl}/weighbridge/entry`, payload).pipe(
      catchError((err) => {
        console.warn('POST /api/weighbridge/entry failed, returning local mock success', err);
        return of({ success: true, status: 'Truck On Weighbridge' });
      })
    );
  }

  /**
   * 5. Weight Captured API: POST /api/weighbridge/capture-weight
   * Fallback: POST /api/weigh/complete
   */
  postWeighbridgeCaptureWeight(weight: number, plateNumber: string): Observable<any> {
    const payload = {
      grossWeight: weight,
      weightTimestamp: new Date().toISOString(),
      weightCaptureStatus: 'Captured',
      plateNumber: plateNumber
    };

    return this.http.post(`${this.baseUrl}/weighbridge/capture-weight`, payload).pipe(
      catchError((err) => {
        console.warn('POST /api/weighbridge/capture-weight failed, trying fallback /api/weigh/complete', err);
        return this.http.post(`${this.baseUrl}/weigh/complete`, { delayMs: 2000 });
      })
    );
  }

  /**
   * 6. Audio Announcement API: POST /api/audio/announcement
   */
  postAudioAnnouncement(announcement: string): Observable<any> {
    const payload = {
      announcement: announcement,
      timestamp: new Date().toISOString()
    };

    return this.http.post(`${this.baseUrl}/audio/announcement`, payload).pipe(
      catchError((err) => {
        console.warn('POST /api/audio/announcement failed, returning local mock success', err);
        return of({ success: true, announcement, timestamp: payload.timestamp });
      })
    );
  }

  /**
   * 7. Exit Barrier Open API: POST /api/barrier/exit/status
   * Fallback: POST /api/barrier/exit/open or /api/barrier/exit/close
   */
  postBarrierExitStatus(status: 'Open' | 'Closed'): Observable<any> {
    const payload = {
      status: status,
      signal: status === 'Open' ? 'Green' : 'Red',
      timestamp: new Date().toISOString()
    };

    return this.http.post(`${this.baseUrl}/barrier/exit/status`, payload).pipe(
      catchError((err) => {
        console.warn('POST /api/barrier/exit/status failed, trying fallback /api/barrier/exit/[open|close]', err);
        const action = status === 'Open' ? 'open' : 'close';
        return this.http.post(`${this.baseUrl}/barrier/exit/${action}`, {});
      })
    );
  }

  /**
   * 8. Truck Exit Completed API: POST /api/vehicle/exit
   * Fallback: POST /api/vehicle/pass
   */
  postVehicleExit(plateNumber: string): Observable<any> {
    const payload = {
      plateNumber: plateNumber,
      status: 'Completed',
      exitTime: new Date().toISOString(),
      journeyCompleted: true
    };

    return this.http.post(`${this.baseUrl}/vehicle/exit`, payload).pipe(
      catchError((err) => {
        console.warn('POST /api/vehicle/exit failed, trying fallback /api/vehicle/pass', err);
        return this.http.post(`${this.baseUrl}/vehicle/pass`, {});
      })
    );
  }
}
