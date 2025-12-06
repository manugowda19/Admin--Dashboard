import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on "Forgot Password" on the login page.',
      expanded: false
    },
    {
      question: 'How do I create a new user?',
      answer: 'Navigate to the Users page and click the "Add User" button. Fill in the required information and save.',
      expanded: false
    },
    {
      question: 'What are the different user roles?',
      answer: 'There are four roles: Superadmin (full access), Admin (user management), Moderator (content management), and Viewer (read-only).',
      expanded: false
    },
    {
      question: 'How do I export data?',
      answer: 'You can export user data from the Users page by clicking the export button and selecting your preferred format (CSV or JSON).',
      expanded: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].expanded = !this.faqs[index].expanded;
  }
}

