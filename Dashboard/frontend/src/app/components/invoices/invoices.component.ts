import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'cost', 'date', 'actions'];

  constructor() {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoices = [
      { id: 'INV-001', name: 'John Doe', email: 'john@example.com', cost: 1250.00, date: '2024-01-15' },
      { id: 'INV-002', name: 'Jane Smith', email: 'jane@example.com', cost: 850.50, date: '2024-01-16' },
      { id: 'INV-003', name: 'Bob Johnson', email: 'bob@example.com', cost: 2100.00, date: '2024-01-17' },
      { id: 'INV-004', name: 'Alice Brown', email: 'alice@example.com', cost: 950.75, date: '2024-01-18' },
      { id: 'INV-005', name: 'Charlie Wilson', email: 'charlie@example.com', cost: 1750.25, date: '2024-01-19' }
    ];
  }

  downloadInvoice(invoice: any) {
    console.log('Downloading invoice:', invoice.id);
    alert(`Downloading invoice ${invoice.id}`);
  }

  viewInvoice(invoice: any) {
    console.log('Viewing invoice:', invoice.id);
    alert(`Viewing invoice ${invoice.id}`);
  }
}

