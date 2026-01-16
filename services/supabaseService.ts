// Supabase Real-Time Service
// FREE, Reliable, and Easy to use!

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

class SupabaseService {
  private supabase: any = null;
  private channel: RealtimeChannel | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Supabase credentials (you'll get these after creating a project)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    console.log('🔧 Initializing Supabase...');
    
    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        
        // Subscribe to attendance channel
        this.channel = this.supabase.channel('attendance-realtime');
        
        this.setupListeners();
        
        // Subscribe to the channel
        this.channel.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Supabase real-time connected!');
          }
        });
        
        console.log('✅ Supabase initialized successfully');
      } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
      }
    } else {
      console.warn('⚠️ Supabase credentials not found. Using localStorage fallback.');
      console.warn('⚠️ Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    }
  }

  private setupListeners() {
    if (!this.channel) return;

    // Listen for clock in events
    this.channel.on('broadcast', { event: 'clock-in' }, (payload: any) => {
      console.log('🟢 Supabase: Employee clocked in', payload);
      this.notifyListeners('CLOCK_IN', payload.payload);
    });

    // Listen for clock out events
    this.channel.on('broadcast', { event: 'clock-out' }, (payload: any) => {
      console.log('🔴 Supabase: Employee clocked out', payload);
      this.notifyListeners('CLOCK_OUT', payload.payload);
    });

    // Listen for attendance updates
    this.channel.on('broadcast', { event: 'attendance-update' }, (payload: any) => {
      console.log('📊 Supabase: Attendance updated', payload);
      this.notifyListeners('ATTENDANCE_UPDATE', payload.payload);
    });

    // Listen for leave requests
    this.channel.on('broadcast', { event: 'leave-request' }, (payload: any) => {
      console.log('📝 Supabase: Leave request', payload);
      this.notifyListeners('LEAVE_REQUEST', payload.payload);
    });

    // Listen for leave actions
    this.channel.on('broadcast', { event: 'leave-action' }, (payload: any) => {
      console.log('✅ Supabase: Leave action', payload);
      this.notifyListeners('LEAVE_ACTION', payload.payload);
    });
  }

  private notifyListeners(eventType: string, data: any) {
    const typeListeners = this.listeners.get(eventType);
    if (typeListeners) {
      typeListeners.forEach(callback => callback(data));
    }
  }

  // Subscribe to events
  on(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Broadcast events (works without backend!)
  broadcast(eventName: string, data: any) {
    if (!this.channel) {
      console.warn('⚠️ Supabase not initialized, using localStorage fallback');
      return;
    }

    try {
      this.channel.send({
        type: 'broadcast',
        event: eventName,
        payload: data
      });
      console.log('📤 Supabase broadcast:', eventName, data);
    } catch (error) {
      console.error('❌ Failed to broadcast:', error);
    }
  }

  // Specific event triggers
  triggerClockIn(employeeId: string, employeeName: string, clockIn: string, isLate: boolean) {
    const data = {
      employeeId,
      employeeName,
      clockIn,
      isLate,
      status: isLate ? 'LATE' : 'CLOCKED_IN',
      timestamp: new Date().toISOString()
    };
    
    this.broadcast('clock-in', data);
  }

  triggerClockOut(employeeId: string, employeeName: string, clockOut: string, duration: string) {
    const data = {
      employeeId,
      employeeName,
      clockOut,
      duration,
      status: 'CLOCKED_OUT',
      timestamp: new Date().toISOString()
    };
    
    this.broadcast('clock-out', data);
  }

  triggerAttendanceUpdate(attendance: any[]) {
    const data = {
      attendance,
      timestamp: new Date().toISOString()
    };
    
    this.broadcast('attendance-update', data);
  }

  triggerLeaveRequest(employeeId: string, employeeName: string, leaveType: string, startDate: string, endDate: string) {
    const data = {
      employeeId,
      employeeName,
      leaveType,
      startDate,
      endDate,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Broadcasting leave request:', data);
    this.broadcast('leave-request', data);
    
    // Also update localStorage
    localStorage.setItem('last_update', Date.now().toString());
  }

  triggerLeaveAction(employeeId: string, employeeName: string, leaveType: string, status: string) {
    const data = {
      employeeId,
      employeeName,
      leaveType,
      status,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Broadcasting leave action:', data);
    this.broadcast('leave-action', data);
    
    // Also update localStorage
    localStorage.setItem('last_update', Date.now().toString());
  }

  // Check if connected
  isConnected(): boolean {
    return this.channel !== null;
  }

  // Disconnect
  disconnect() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Export singleton
export const supabaseService = new SupabaseService();
