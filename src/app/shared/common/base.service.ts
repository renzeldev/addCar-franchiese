import { throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export abstract class BaseService {
  jwtToken: any;

  constructor() {}

  protected prepareHeaders(): HttpHeaders {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return headers;
  }

  protected handleError(error: any) {
    const applicationError = error.headers.get('Application-Error');

    // either applicationError in header or model error in body
    if (applicationError) {
      return throwError(applicationError);
    }
    return throwError(error);
  }
}
