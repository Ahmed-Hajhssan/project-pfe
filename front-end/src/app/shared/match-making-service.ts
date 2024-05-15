import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { catchError, map } from 'rxjs/operators';




@Injectable({ providedIn: "root" })

export class MatchMakingService {

  private baseUrl = environment.domain;
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

    getUser(id: any): Observable<any> {
    let api = `${this.baseUrl}/read/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res) => {
        return res || {};
      }),
      catchError(this.handleError)
    );
  }

  sendRequest(senderId: any, receiverId: any): Observable<any> {
    const url = `${this.baseUrl}/request/${senderId}/${receiverId}`;
    return this.http.put<any>(url,{});
  }

  acceptRequest(senderId: any, receiverId: any): Observable<any> {
    const url = `${this.baseUrl}/matchmaking/${senderId}/${receiverId}`;
    return this.http.put<any>(url,{});
  }

  declineRequest(senderId: any, receiverId: any): Observable<any> {
    const url = `${this.baseUrl}/decline/${senderId}/${receiverId}`;
    return this.http.put<any>(url,{});
  }

  countChats(): Observable<any> {
    const url = `${this.baseUrl}/getChats`;
    return this.http.get(url);
  }

  countMatchmakings(): Observable<any> {
    const url = `${this.baseUrl}/getMatchmakings`;
    return this.http.get(url);
  }

  getEntrepreneurs(): Observable<any> {
    const url = `${this.baseUrl}/api/getEntrepreneurs`;
    return this.http.get(url);
  }

  getInvestors(): Observable<any> {
    const url = `${this.baseUrl}/investor/getInvestors`;
    return this.http.get(url);
  }

  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }
}