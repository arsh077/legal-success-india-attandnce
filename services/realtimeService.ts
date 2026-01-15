// Real-time Service using BroadcastChannel API
// This provides real-time sync across browser tabs WITHOUT needing a backend server

class RealtimeService {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('attendance_updates');
      this.setupListener();
    }
  }

  private setupListener() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      const { type, data } = event.data;
      
      // Notify all listeners for this event type
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.forEach(callback => callback(data));
      }

      // Notify all listeners for 'all' events
      const allListeners = this.listeners.get('all');
      if (allListeners) {
        allListeners.forEach(callback => callback({ type, data }));
      }
    };
  }

  // Subscribe to specific event types
  on(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Broadcast event to all tabs
  broadcast(eventType: string, data: any) {
    if (!this.channel) {
      console.warn('BroadcastChannel not supported');
      return;
    }

    this.channel.postMessage({
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Specific event broadcasters
  broadcastClockIn(employeeId: string, employeeName: string, clockIn: string, isLate: boolean) {
    this.broadcast('CLOCK_IN', {
      employeeId,
      employeeName,
      clockIn,
      isLate,
      status: isLate ? 'LATE' : 'CLOCKED_IN'
    });
  }

  broadcastClockOut(employeeId: string, employeeName: string, clockOut: string, duration: string) {
    this.broadcast('CLOCK_OUT', {
      employeeId,
      employeeName,
      clockOut,
      duration,
      status: 'CLOCKED_OUT'
    });
  }

  broadcastAttendanceUpdate(attendance: any[]) {
    this.broadcast('ATTENDANCE_UPDATE', {
      attendance,
      timestamp: new Date().toISOString()
    });
  }

  broadcastEmployeeUpdate(employee: any) {
    this.broadcast('EMPLOYEE_UPDATE', {
      employee,
      timestamp: new Date().toISOString()
    });
  }

  // Close channel
  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Helper hook for React components
export const useRealtimeUpdates = (eventType: string, callback: Function) => {
  const unsubscribe = realtimeService.on(eventType, callback);
  
  // Cleanup on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', unsubscribe);
  }
  
  return unsubscribe;
};
