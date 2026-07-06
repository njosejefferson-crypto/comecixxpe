import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order as OrderModel } from '../../shared/models/order';

const API_URL = 'http://localhost:3002/orders';

@Injectable({
  providedIn: 'root',
})
export class Order {
  constructor(private http: HttpClient) {}

  create(order: OrderModel): Observable<OrderModel> {
    return this.http.post<OrderModel>(API_URL, order);
  }
}
