import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthModel } from "./auth-model";
import { Observable, Subject, throwError } from "rxjs";
import { Router } from "@angular/router";
import { catchError, map } from 'rxjs/operators';
import { environment } from "../../environments/environment";
import { profile } from "console";





@Injectable({ providedIn: "root" })

export class AuthService {
  profileScore:number=0;
  pourcentage:any=0;
  private token: string;
  private authenticatedSub = new Subject<boolean>();
  private isAuthenticated = false;
  private logoutTimer: any;
  private userId: string;
  private role: string;
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  private baseUrl = environment.domain;


  getIsAuthenticated() {
    return this.isAuthenticated;
  }
  getAuthenticatedSub() {
    return this.authenticatedSub.asObservable();
  }
  getToken() {
    return this.token;
  }
  getUserId() {
    return this.userId;
  }
  getUserRole() {
    return this.role;
  }

  constructor(private http: HttpClient, private router: Router) { }

  addPoste(userId: any, posteData: any): Observable<any> {
    const url = `${this.baseUrl}/addPoste/${userId}`;
    return this.http.post(url, posteData);
  }

  getpostes(userId: string): Observable<any> {
    const url = `${this.baseUrl}/getPostes/${userId}`;
    return this.http.get(url);
  }

  sendEmail(email: string) {
    const url = `${this.baseUrl}/send-email`;
    return this.http.post<any>(url, { email: email });
  }
  resetPassword(resetObj: any) {
    const url = `${this.baseUrl}/reset-password`;
    return this.http.post<any>(url, resetObj);
  }

  getSectors(userId: string): Observable<string[]> {
    const url = `${this.baseUrl}/api/getsector/${userId}`;
    return this.http.get<string[]>(url);
  }

  deleteSector(userId: string, sectorName: string): Observable<any> {
    const url = `${this.baseUrl}/api/deleteSector/${userId}/${sectorName}`;
    return this.http.delete(url);
  }

  createMember(userId: string, memberData: any): Observable<any> {
    const url = `${this.baseUrl}/api/createMember/${userId}`;
    return this.http.post(url, memberData);
  }

  getMembers(userId: string): Observable<any> {
    const url = `${this.baseUrl}/api/getMembers/${userId}`;
    return this.http.get(url);
  }

  getMember(memberId: string): Observable<any> {
    const url = `${this.baseUrl}/api/getMember/${memberId}`;
    return this.http.get<any>(url);
  }

  updateMember(memberId: string, memberData: any): Observable<any> {
    const url = `${this.baseUrl}/api/updateMember/${memberId}`;
    return this.http.put<any>(url, memberData);
  }

  deleteMember(userId: string, memberId: string): Observable<any> {
    const url = `${this.baseUrl}/api/deleteMember/${userId}/${memberId}`;
    return this.http.delete<any>(url);
  }

  deleteFile(userId: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/deletefile/${userId}`);
  }

  uploadFiles(formData: FormData) {
    return this.http.post(`${this.baseUrl}/api/multiplefiles`, formData);
  }

  deleteFiles(userId: string, fileName: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/deletefile/${userId}/${fileName}`);
  }

  deleteVideoPitch(userId: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/deleteVideo/${userId}`);
  }

  deleteVideoPitchUrl(userId: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/deletePitchUrl/${userId}`);
  }

  uploadFile(formData: FormData) {
    return this.http.post(`${this.baseUrl}/api/file`, formData);
  }

  signupUser(email: string, password: string, role: string): Observable<any> {
    const authData: AuthModel = { email: email, password: password, role: role };
    console.log(authData);
  
    return this.http.post(`${this.baseUrl}/sign-up`, authData);
  }

  loginUser(email: string, password: string): Observable<any> {
    const authData: AuthModel = { email: email, password: password };

    return this.http.post<{ token: string; expiresIn: number; userId: string, role: string }>(`${this.baseUrl}/login`, authData)
      .pipe(
        map(res => {
          this.token = res.token;
          if (this.token) {
            this.authenticatedSub.next(true);
            this.isAuthenticated = true;
            this.userId = res.userId;
            this.role = res.role;
            console.log(this.role);
            if (this.role == "entrepreneur")
              this.router.navigate([`/Profile/${this.userId}`]);
            if (this.role == "investor")
              this.router.navigate([`/investorProfile/${this.userId}`]);
            if (this.role == "admin")
              this.router.navigate([`/admin/${this.userId}`]);
            this.logoutTimer = setTimeout(() => { this.logout() }, res.expiresIn * 1000);
            const now = new Date();
            const expiresDate = new Date(now.getTime() + (res.expiresIn * 1000));
            this.storeLoginDetails(this.token, expiresDate, this.userId, this.role);
          }
          return res; 
        })
      );
  }

  getUser(id: any): Observable<any> {
    let api = `${this.baseUrl}/api/read/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res) => {
        return res || {};
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: any, data: any): Observable<any> {
    let api = `${this.baseUrl}/api/update/${id}`;
    return this.http
      .put(api, data, { headers: this.headers })
      .pipe(catchError(this.handleError));
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

  logout() {
    this.token = '';
    this.isAuthenticated = false;
    this.authenticatedSub.next(false);
    this.router.navigate(['/login']);
    clearTimeout(this.logoutTimer);
    this.clearLoginDetails();
  }

  storeLoginDetails(token: string, expirationDate: Date, userId: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiresIn', expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("role", role);
  }

  clearLoginDetails() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  }

  getLocalStorageData() {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      const expiresIn = localStorage.getItem('expiresIn');

      if (!token || !expiresIn) {
        return;
      }
      return {
        'token': token,
        'expiresIn': new Date(expiresIn)
      }
    }
    return null;
  }

  authenticateFromLocalStorage() {
    const localStorageData = this.getLocalStorageData();
    if (localStorageData) {
      const now = new Date();
      const expiresIn = localStorageData.expiresIn.getTime() - now.getTime();

      if (expiresIn > 0) {
        this.token = localStorageData.token;
        this.isAuthenticated = true;
        this.authenticatedSub.next(true);

        // Assuming this.logoutTimer is defined and has a setTimeout method
        if (this.logoutTimer && typeof this.logoutTimer.setTimeout === 'function') {
          this.logoutTimer.setTimeout(expiresIn / 1000);
        }
      }
    }
  }


  createCurrentlyRaising(employeeId: any, currentlyRaisingData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/${employeeId}/currently_raising`, currentlyRaisingData)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCurrentlyRaising(employeeId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/${employeeId}/currently_raising`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateCurrentlyRaising(employeeId: any, currentlyRaisingData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/${employeeId}/currently_raising`, currentlyRaisingData)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteCurrentlyRaising(employeeId: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/${employeeId}/currently_raising`)
      .pipe(
        catchError(this.handleError)
      );
  }


  // Create a new question for an employee
  createQuestion(employeeId: any, questionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/${employeeId}/questions`, questionData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Read all questions for an employee
  getQuestions(employeeId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/${employeeId}/questions`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Read a specific question for an employee
  getQuestion(employeeId: any, questionId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/${employeeId}/questions/${questionId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update a question for an employee
  updateQuestion(employeeId: any, questionId: any, questionData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/${employeeId}/questions/${questionId}`, questionData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete a question for an employee
  deleteQuestion(employeeId: any, questionId: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/${employeeId}/questions/${questionId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createPreviousRound(employeeId: any, roundData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/${employeeId}/previous_round`, roundData);
  }

  // Get Previous_round for an employee
  getPreviousRounds(employeeId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/${employeeId}/previous_round`);
  }

  // Update a Previous_round for an employee
  updatePreviousRound(employeeId: any, roundId: any, roundData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/${employeeId}/previous_round/${roundId}`, roundData);
  }

  // Delete a Previous_round for an employee
  deletePreviousRound(employeeId: any, roundId: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/${employeeId}/previous_round/${roundId}`);
  }

  // Get a single Previous_round for an employee
  getPreviousRound(employeeId: any, roundId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/${employeeId}/previous_round/${roundId}`);
  }

}




