
import { Employee, UserRole } from '../types';
import { INITIAL_EMPLOYEES, AUTHORIZED_USERS } from '../constants';

class AuthService {
  private currentUser: Employee | null = null;

  // Secure login - validates email and password
  authenticate(email: string, password: string): { success: boolean; user?: Employee; error?: string } {
    // Check if user is authorized
    const authorizedUser = AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!authorizedUser) {
      return { success: false, error: 'Invalid credentials. Access denied.' };
    }

    // Find employee data
    const employee = INITIAL_EMPLOYEES.find(
      emp => emp.email.toLowerCase() === email.toLowerCase()
    );

    if (!employee) {
      return { success: false, error: 'Employee data not found.' };
    }

    this.currentUser = employee;
    localStorage.setItem('user', JSON.stringify(employee));
    localStorage.setItem('auth_token', btoa(`${email}:${password}`)); // Simple token
    
    return { success: true, user: employee };
  }

  login(role: UserRole): Employee {
    // Fallback for role-based login (kept for compatibility)
    const user = INITIAL_EMPLOYEES.find(emp => emp.role === role) || INITIAL_EMPLOYEES[0];
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  }

  getCurrentUser(): Employee | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!localStorage.getItem('auth_token');
  }

  // Verify if current session is valid
  verifySession(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }

    try {
      const decoded = atob(token);
      const [email, password] = decoded.split(':');
      const authorized = AUTHORIZED_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      return !!authorized;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();