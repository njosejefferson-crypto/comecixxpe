import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product as ProductModel } from '../../shared/models/product';

const API_URL = 'http://localhost:3000/products';

@Injectable({
  providedIn: 'root',
})
export class Product {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(API_URL);
  }

  getById(id: number): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${API_URL}/${id}`);
  }
}
