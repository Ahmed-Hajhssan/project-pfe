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

  requestMaching(senderId: any, receiverId: any): Observable<any> {
    const url = `${this.baseUrl}/request/${senderId}/${receiverId}`;
    return this.http.put<any>(url,{});
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