import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { catchError, map } from 'rxjs/operators';




@Injectable({ providedIn: "root" })

export class InvestorService {

  private baseUrl = environment.domain;
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  getSectors(userId: string): Observable<string[]> {
    const url = `${this.baseUrl}/investor/getsector/${userId}`;
    return this.http.get<string[]>(url);
  }

  deleteSector(userId: string, sectorName: string): Observable<any> {
    const url = `${this.baseUrl}/investor/deleteSector/${userId}/${sectorName}`;
    return this.http.delete(url);
  }

  uploadFile(formData: FormData) {
    return this.http.post(`${this.baseUrl}/investor/file`, formData);
  }


  getUser(id: any): Observable<any> {
    let api = `${this.baseUrl}/investor/read/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res) => {
        return res || {};
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: any, data: any): Observable<any> {
    let api = `${this.baseUrl}/investor/update/${id}`;
    return this.http
      .put(api, data, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }


  createCompany(userId: any, companyData: any): Observable<any> {
    const url = `${this.baseUrl}/investor/createCompany/${userId}`;
    return this.http.post(url, companyData);
  }

  getCompanies(userId: any): Observable<any> {
    const url = `${this.baseUrl}/investor/getCompanies/${userId}`;
    return this.http.get(url);
  }

  getCompany(companyId: any): Observable<any> {
    const url = `${this.baseUrl}/investor/getCompany/${companyId}`;
    return this.http.get<any>(url);
  }

  updateCompany(companyId: any, companyData: any): Observable<any> {
    const url = `${this.baseUrl}/investor/updateCompany/${companyId}`;
    return this.http.put<any>(url, companyData);
  }

  deleteCompany(userId: any, companyId: any): Observable<any> {
    const url = `${this.baseUrl}/investor/deleteCompany/${userId}/${companyId}`;
    return this.http.delete<any>(url);
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