import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { catchError, map } from 'rxjs/operators';



@Injectable({ providedIn: "root" })

export class AdminService {

  private baseUrl = environment.domain;
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  getInvestors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/investor/getInvestors`);
  }

  getEntrepreneurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/getEntrepreneurs`);
  }

  updateUser(id: any, data: any): Observable<any> {
    let api = `${this.baseUrl}/update/${id}`;
    return this.http
      .put(api, data, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getAllStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAllStatus`);
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