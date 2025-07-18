import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export function AuthInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Add withCredentials to all requests for session cookies
  const authReq = request.clone({
    withCredentials: true
  });
  
  return next(authReq);
} 