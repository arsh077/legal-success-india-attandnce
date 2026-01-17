
import React, { useState, useEffect } from 'react';
import { UserRole, Employee, AttendanceRecord, LeaveRequest, LeaveStatus, AttendanceStatus } from './types';
import { authService } from './services/authService';
import { realtimeService } from './services/realtimeService';
import { pusherService } from './services/pusherService';
import { supabaseService } from './services/supabaseService';
import { notificationService, Notification } from './services/notificationService';
import { INITIAL_EMPLOYEES, AUTHORIZED_USERS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Login from './pages/Login';
import NotificationBell from './components/NotificationBell';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('ls_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('ls_attendance');
    // Start fresh - no demo data
    // Real attendance will be recorded from February onwards
    return saved ? JSON.parse(saved) : [];
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('ls_leave_requests');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const user = authService.getCurrentUser();
    // Verify session is valid
    if (user && !authService.verifySession()) {
      authService.logout();
      return null;
    }
    return user;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('ls_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [isProcessingClock, setIsProcessingClock] = useState(false);

  // Clear old demo data on first load (one-time reset)
  useEffect(() => {
    const resetDone = localStorage.getItem('data_reset_feb_2026');
    if (!resetDone) {
      console.log('🔄 Resetting data for February 2026 fresh start...');
      localStorage.removeItem('ls_attendance');
      localStorage.setItem('data_reset_feb_2026', 'true');
      console.log('✅ Data reset complete. Fresh start from February!');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ls_employees', JSON.stringify(employees));
    localStorage.setItem('ls_attendance', JSON.stringify(attendance));
    localStorage.setItem('ls_leave_requests', JSON.stringify(leaveRequests));
    localStorage.setItem('ls_notifications', JSON.stringify(notifications));
    localStorage.setItem('last_update', Date.now().toString());
    
    // Broadcast attendance updates via ALL channels with actual data
    supabaseService.triggerAttendanceUpdate(attendance); // Supabase (Primary - Most Reliable)
    pusherService.triggerAttendanceUpdate(attendance); // Pusher (Backup)
    realtimeService.broadcastAttendanceUpdate(attendance); // BroadcastChannel (Fallback)
    
    // Also trigger a custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('attendance-changed', { 
      detail: { attendance, timestamp: Date.now() } 
    }));
  }, [employees, attendance, leaveRequests, notifications]);

  // Setup real-time listeners (Supabase + Pusher + BroadcastChannel + Polling)
  useEffect(() => {
    console.log('🔧 Setting up real-time listeners...');
    
    // Subscribe to notification service
    const unsubNotifications = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    
    // SUPABASE LISTENERS (Primary - Most Reliable for cross-device)
    const unsubSupabaseClockIn = supabaseService.on('CLOCK_IN', (data: any) => {
      console.log('🟢 Supabase: Employee clocked in', data);
      setTimeout(() => {
        const storedAttendance = localStorage.getItem('ls_attendance');
        if (storedAttendance) {
          setAttendance(JSON.parse(storedAttendance));
        }
      }, 100);
      
      if (currentUser && currentUser.role === UserRole.ADMIN) {
        notificationService.clockIn(data.employeeName, data.clockIn, data.isLate);
      }
    });

    const unsubSupabaseClockOut = supabaseService.on('CLOCK_OUT', (data: any) => {
      console.log('🔴 Supabase: Employee clocked out', data);
      setTimeout(() => {
        const storedAttendance = localStorage.getItem('ls_attendance');
        if (storedAttendance) {
          setAttendance(JSON.parse(storedAttendance));
        }
      }, 100);
      
      if (currentUser && currentUser.role === UserRole.ADMIN) {
        notificationService.clockOut(data.employeeName, data.clockOut, data.duration);
      }
    });

    const unsubSupabaseAttendance = supabaseService.on('ATTENDANCE_UPDATE', (data: any) => {
      console.log('📊 Supabase: Attendance updated', data);
      if (data && data.attendance) {
        console.log('📥 Syncing attendance from Supabase:', data.attendance.length, 'records');
        setAttendance(data.attendance);
        localStorage.setItem('ls_attendance', JSON.stringify(data.attendance));
      }
    });
    
    const unsubSupabaseLeaveRequest = supabaseService.on('LEAVE_REQUEST', (data: any) => {
      console.log('📝 Supabase: Leave request', data);
      // Force reload from localStorage
      const storedLeaves = localStorage.getItem('ls_leave_requests');
      if (storedLeaves) {
        const leaves = JSON.parse(storedLeaves);
        console.log('📥 Syncing leave requests:', leaves.length, 'requests');
        setLeaveRequests(leaves);
      }
      
      if (currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER)) {
        notificationService.leaveRequest(data.employeeName, data.leaveType, data.startDate, data.endDate);
      }
    });
    
    const unsubSupabaseLeaveAction = supabaseService.on('LEAVE_ACTION', (data: any) => {
      console.log('✅ Supabase: Leave action', data);
      // Force reload from localStorage
      const storedLeaves = localStorage.getItem('ls_leave_requests');
      if (storedLeaves) {
        const leaves = JSON.parse(storedLeaves);
        console.log('📥 Syncing leave actions:', leaves.length, 'requests');
        setLeaveRequests(leaves);
      }
      
      if (currentUser && data.employeeId === currentUser.id) {
        if (data.status === 'APPROVED') {
          notificationService.leaveApproved(data.leaveType);
        } else {
          notificationService.leaveRejected(data.leaveType);
        }
      }
    });
    
    // Employee update listeners
    const unsubSupabaseEmployeeUpdate = supabaseService.on('EMPLOYEE_UPDATE', (data: any) => {
      console.log('👤 Supabase: Employee updated', data);
      // Force reload employees from localStorage
      const storedEmployees = localStorage.getItem('ls_employees');
      if (storedEmployees) {
        const employees = JSON.parse(storedEmployees);
        console.log('📥 Syncing employees:', employees.length, 'employees');
        setEmployees(employees);
        
        // Update current user if it's the same person
        if (currentUser && currentUser.id === data.employeeId) {
          const updatedUser = employees.find((e: Employee) => e.id === data.employeeId);
          if (updatedUser) {
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('👤 Current user updated:', updatedUser.name);
          }
        }
      }
    });
    
    // PUSHER LISTENERS (Backup - if Supabase fails)
    const unsubPusherClockIn = pusherService.on('CLOCK_IN', (data: any) => {
      console.log('🟢 Pusher: Employee clocked in', data);
      setTimeout(() => {
        const storedAttendance = localStorage.getItem('ls_attendance');
        if (storedAttendance) {
          setAttendance(JSON.parse(storedAttendance));
        }
      }, 100);
      
      if (currentUser && currentUser.role === UserRole.ADMIN) {
        notificationService.clockIn(data.employeeName, data.clockIn, data.isLate);
      }
    });

    const unsubPusherClockOut = pusherService.on('CLOCK_OUT', (data: any) => {
      console.log('🔴 Pusher: Employee clocked out', data);
      setTimeout(() => {
        const storedAttendance = localStorage.getItem('ls_attendance');
        if (storedAttendance) {
          setAttendance(JSON.parse(storedAttendance));
        }
      }, 100);
      
      if (currentUser && currentUser.role === UserRole.ADMIN) {
        notificationService.clockOut(data.employeeName, data.clockOut, data.duration);
      }
    });

    const unsubPusherAttendance = pusherService.on('ATTENDANCE_UPDATE', (data: any) => {
      console.log('📊 Pusher: Attendance updated', data);
      if (data && data.attendance) {
        console.log('📥 Syncing attendance from Pusher event:', data.attendance.length, 'records');
        setAttendance(data.attendance);
        localStorage.setItem('ls_attendance', JSON.stringify(data.attendance));
      }
    });
    
    const unsubPusherLeaveRequest = pusherService.on('LEAVE_REQUEST', (data: any) => {
      console.log('📝 Pusher: Leave request received', data);
      setTimeout(() => {
        const storedLeaves = localStorage.getItem('ls_leave_requests');
        if (storedLeaves) {
          setLeaveRequests(JSON.parse(storedLeaves));
        }
      }, 100);
      
      if (currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER)) {
        notificationService.leaveRequest(data.employeeName, data.leaveType, data.startDate, data.endDate);
      }
    });
    
    const unsubPusherLeaveAction = pusherService.on('LEAVE_ACTION', (data: any) => {
      console.log('✅ Pusher: Leave action taken', data);
      setTimeout(() => {
        const storedLeaves = localStorage.getItem('ls_leave_requests');
        if (storedLeaves) {
          setLeaveRequests(JSON.parse(storedLeaves));
        }
      }, 100);
      
      if (currentUser && data.employeeId === currentUser.id) {
        if (data.status === 'APPROVED') {
          notificationService.leaveApproved(data.leaveType);
        } else {
          notificationService.leaveRejected(data.leaveType);
        }
      }
    });
    
    // Pusher employee update listener
    const unsubPusherEmployeeUpdate = pusherService.on('employee-update', (data: any) => {
      console.log('👤 Pusher: Employee updated', data);
      setTimeout(() => {
        const storedEmployees = localStorage.getItem('ls_employees');
        if (storedEmployees) {
          const employees = JSON.parse(storedEmployees);
          setEmployees(employees);
          
          // Update current user if it's the same person
          if (currentUser && currentUser.id === data.employeeId) {
            const updatedUser = employees.find((e: Employee) => e.id === data.employeeId);
            if (updatedUser) {
              setCurrentUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        }
      }, 100);
    });

    // BROADCAST CHANNEL LISTENERS (Backup - same browser only)
    const unsubClockIn = realtimeService.on('CLOCK_IN', (data: any) => {
      console.log('🟢 BroadcastChannel: Employee clocked in', data);
      const storedAttendance = localStorage.getItem('ls_attendance');
      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance));
      }
    });

    const unsubClockOut = realtimeService.on('CLOCK_OUT', (data: any) => {
      console.log('🔴 BroadcastChannel: Employee clocked out', data);
      const storedAttendance = localStorage.getItem('ls_attendance');
      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance));
      }
    });

    const unsubAttendance = realtimeService.on('ATTENDANCE_UPDATE', (data: any) => {
      console.log('📊 BroadcastChannel: Attendance updated', data);
      const storedAttendance = localStorage.getItem('ls_attendance');
      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance));
      }
    });
    
    // BroadcastChannel employee update listener
    const unsubEmployeeUpdate = realtimeService.on('EMPLOYEE_UPDATE', (data: any) => {
      console.log('👤 BroadcastChannel: Employee updated', data);
      const storedEmployees = localStorage.getItem('ls_employees');
      if (storedEmployees) {
        const employees = JSON.parse(storedEmployees);
        setEmployees(employees);
        
        // Update current user if it's the same person
        if (currentUser && currentUser.id === data.employeeId) {
          const updatedUser = employees.find((e: Employee) => e.id === data.employeeId);
          if (updatedUser) {
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      }
    });

    // STORAGE EVENT LISTENER (Cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ls_attendance' && e.newValue) {
        console.log('💾 Storage changed: Syncing attendance');
        setAttendance(JSON.parse(e.newValue));
      }
      if (e.key === 'ls_employees' && e.newValue) {
        console.log('💾 Storage changed: Syncing employees');
        const employees = JSON.parse(e.newValue);
        setEmployees(employees);
        
        // Update current user if it's the same person
        if (currentUser) {
          const updatedUser = employees.find((e: Employee) => e.id === currentUser.id);
          if (updatedUser && updatedUser.name !== currentUser.name) {
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('👤 Current user name updated via storage:', updatedUser.name);
          }
        }
      }
      if (e.key === 'ls_leave_requests' && e.newValue) {
        console.log('💾 Storage changed: Syncing leave requests');
        setLeaveRequests(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // POLLING MECHANISM (Fallback - checks every 1 second for faster sync)
    let lastUpdate = Date.now();
    const pollInterval = setInterval(() => {
      const storedAttendance = localStorage.getItem('ls_attendance');
      const storedEmployees = localStorage.getItem('ls_employees');
      const storedLeaves = localStorage.getItem('ls_leave_requests');
      const lastUpdateTime = localStorage.getItem('last_update');
      
      if (lastUpdateTime && parseInt(lastUpdateTime) > lastUpdate) {
        if (storedAttendance) {
          console.log('🔄 Polling: Detected attendance change, syncing...');
          setAttendance(JSON.parse(storedAttendance));
        }
        if (storedEmployees) {
          console.log('🔄 Polling: Detected employee change, syncing...');
          const employees = JSON.parse(storedEmployees);
          setEmployees(employees);
          
          // Update current user if needed
          if (currentUser) {
            const updatedUser = employees.find((e: Employee) => e.id === currentUser.id);
            if (updatedUser && updatedUser.name !== currentUser.name) {
              setCurrentUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        }
        if (storedLeaves) {
          console.log('🔄 Polling: Detected leave requests change, syncing...');
          setLeaveRequests(JSON.parse(storedLeaves));
        }
        lastUpdate = parseInt(lastUpdateTime);
      }
    }, 1000); // Check every 1 second instead of 2

    // Cleanup
    return () => {
      unsubNotifications();
      unsubSupabaseClockIn();
      unsubSupabaseClockOut();
      unsubSupabaseAttendance();
      unsubSupabaseLeaveRequest();
      unsubSupabaseLeaveAction();
      unsubSupabaseEmployeeUpdate();
      unsubPusherClockIn();
      unsubPusherClockOut();
      unsubPusherAttendance();
      unsubPusherLeaveRequest();
      unsubPusherLeaveAction();
      unsubPusherEmployeeUpdate();
      unsubClockIn();
      unsubClockOut();
      unsubAttendance();
      unsubEmployeeUpdate();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [currentUser]);

  const handleLogin = (role: UserRole, email: string) => {
    // First, ensure employees are loaded from INITIAL_EMPLOYEES if not in state
    const currentEmployees = employees.length > 0 ? employees : INITIAL_EMPLOYEES;
    
    const user = currentEmployees.find(e => e.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // If user not found, reload from INITIAL_EMPLOYEES and try again
      setEmployees(INITIAL_EMPLOYEES);
      localStorage.setItem('ls_employees', JSON.stringify(INITIAL_EMPLOYEES));
      
      const userRetry = INITIAL_EMPLOYEES.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (!userRetry) {
        alert('User not found. Please contact administrator.');
        return;
      }
      
      // Use the found user from retry
      completeLogin(userRetry, role, email);
      return;
    }
    
    completeLogin(user, role, email);
  };

  const completeLogin = (user: Employee, role: UserRole, email: string) => {
    // Create auth token for session
    const authUser = AUTHORIZED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (authUser) {
      const token = btoa(`${authUser.email}:${authUser.password}`);
      localStorage.setItem('auth_token', token);
    }
    
    // Set user in auth service
    authService.login(role);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Force update state
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };
  
  // Notification handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Navigate to appropriate page based on notification type
    if (notification.type === 'LEAVE_REQUEST' || notification.type === 'LEAVE_APPROVED' || notification.type === 'LEAVE_REJECTED') {
      setActiveTab('leaves');
    } else if (notification.type === 'CLOCK_IN' || notification.type === 'CLOCK_OUT') {
      setActiveTab('dashboard');
    }
  };

  // State Mutators
  const onClockToggle = (empId: string) => {
    console.log('🎯 App: onClockToggle called with empId:', empId);
    console.log('🔍 App: Current state:', {
      isProcessingClock,
      attendanceCount: attendance.length,
      employeesCount: employees.length,
      currentUser: currentUser?.name
    });
    
    // Prevent double-click with stronger checks
    if (isProcessingClock) {
      console.log('⚠️ App: Clock action already in progress, ignoring...');
      return;
    }
    
    // Additional check for rapid clicks
    const lastClockAction = localStorage.getItem('last_clock_action');
    const now = Date.now();
    if (lastClockAction && (now - parseInt(lastClockAction)) < 5000) {
      console.log('⚠️ App: Clock action too soon after last action, ignoring...');
      console.log('⏰ App: Time since last action:', now - parseInt(lastClockAction), 'ms');
      return;
    }
    
    setIsProcessingClock(true);
    localStorage.setItem('last_clock_action', now.toString());
    console.log('🔒 App: Clock action started for employee:', empId);
    
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 App: Today date:', today);
    
    const existing = attendance.find(a => a.employeeId === empId && a.date === today && !a.clockOut);
    console.log('🔍 App: Existing attendance record:', existing);
    console.log('📊 App: All attendance records for user:', attendance.filter(a => a.employeeId === empId));

    if (existing) {
      // Clock Out
      console.log('🔴 App: Clocking out...');
      const clockOutTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      console.log('🕐 App: Clock out time:', clockOutTime);
      
      const updatedAttendance = attendance.map(a => 
        a.id === existing.id ? { ...a, clockOut: clockOutTime } : a
      );
      console.log('📝 App: Updated attendance record:', updatedAttendance.find(a => a.id === existing.id));
      setAttendance(updatedAttendance);
      
      // Broadcast clock out event via ALL channels
      const employee = employees.find(e => e.id === empId);
      if (employee) {
        console.log('👤 App: Found employee for broadcast:', employee.name);
        const clockInTime = new Date(`${today} ${existing.clockIn}`);
        const clockOutTimeObj = new Date();
        const duration = Math.round((clockOutTimeObj.getTime() - clockInTime.getTime()) / (1000 * 60));
        const durationStr = `${Math.floor(duration / 60)}h ${duration % 60}m`;
        console.log('⏱️ App: Calculated duration:', durationStr);
        
        // Supabase (Primary - Most Reliable)
        supabaseService.triggerClockOut(empId, employee.name, clockOutTime, durationStr);
        
        // Pusher (Backup)
        pusherService.triggerClockOut(empId, employee.name, clockOutTime, durationStr);
        
        // BroadcastChannel (Fallback)
        realtimeService.broadcastClockOut(empId, employee.name, clockOutTime, durationStr);
        
        // Force update localStorage with timestamp
        localStorage.setItem('ls_attendance', JSON.stringify(updatedAttendance));
        localStorage.setItem('last_update', Date.now().toString());
        console.log('💾 App: Saved to localStorage');
      }
    } else {
      // Clock In
      console.log('🟢 App: Clocking in...');
      const now = new Date();
      // Late if after 10:40 AM (10 hours 40 minutes)
      const isLate = now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() > 40);
      const clockInTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      console.log('🕐 App: Clock in time:', clockInTime, 'Late:', isLate);
      
      const newRecord: AttendanceRecord = {
        id: `ATT${Math.random().toString(36).substr(2, 9)}`,
        employeeId: empId,
        date: today,
        clockIn: clockInTime,
        status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
      };
      console.log('📝 App: New attendance record:', newRecord);
      
      const newAttendance = [newRecord, ...attendance];
      setAttendance(newAttendance);
      console.log('📊 App: Total attendance records after add:', newAttendance.length);
      
      // Broadcast clock in event via ALL channels
      const employee = employees.find(e => e.id === empId);
      if (employee) {
        console.log('👤 App: Found employee for broadcast:', employee.name);
        
        // Supabase (Primary - Most Reliable)
        supabaseService.triggerClockIn(empId, employee.name, clockInTime, isLate);
        
        // Pusher (Backup)
        pusherService.triggerClockIn(empId, employee.name, clockInTime, isLate);
        
        // BroadcastChannel (Fallback)
        realtimeService.broadcastClockIn(empId, employee.name, clockInTime, isLate);
        
        // Force update localStorage with timestamp
        localStorage.setItem('ls_attendance', JSON.stringify(newAttendance));
        localStorage.setItem('last_update', Date.now().toString());
        console.log('💾 App: Saved to localStorage');
      } else {
        console.error('❌ App: Employee not found for empId:', empId);
      }
    }
    
    // Unlock after 5 seconds (increased from 3)
    setTimeout(() => {
      setIsProcessingClock(false);
      console.log('🔓 App: Clock action unlocked');
    }, 5000);
  };

  // Employee update handler with real-time sync
  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    console.log('👤 Updating employee:', updatedEmployee.name);
    
    // Update employees state
    const updatedEmployees = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
    setEmployees(updatedEmployees);
    
    // Update current user if it's the same person
    if (currentUser && currentUser.id === updatedEmployee.id) {
      setCurrentUser(updatedEmployee);
      localStorage.setItem('user', JSON.stringify(updatedEmployee));
    }
    
    // Update AUTHORIZED_USERS in localStorage for login consistency
    const authUsers = JSON.parse(localStorage.getItem('authorized_users') || '[]');
    const updatedAuthUsers = authUsers.map((user: any) => 
      user.email === updatedEmployee.email ? { ...user, name: updatedEmployee.name } : user
    );
    localStorage.setItem('authorized_users', JSON.stringify(updatedAuthUsers));
    
    // Broadcast employee update via all channels
    supabaseService.triggerEmployeeUpdate(updatedEmployee.id, updatedEmployee.name, updatedEmployee.email, updatedEmployee.phone);
    pusherService.trigger('employee-update', {
      employeeId: updatedEmployee.id,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
      phone: updatedEmployee.phone,
      timestamp: new Date().toISOString()
    });
    realtimeService.broadcast('EMPLOYEE_UPDATE', {
      employeeId: updatedEmployee.id,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
      phone: updatedEmployee.phone
    });
    
    console.log('✅ Employee update broadcasted to all devices');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          role={currentUser.role} 
          employees={employees} 
          attendance={attendance} 
          leaves={leaveRequests}
          currentUser={currentUser}
          onClockToggle={onClockToggle}
        />;
      case 'attendance':
        return <Attendance 
          currentUser={currentUser} 
          attendance={attendance} 
          onClockToggle={onClockToggle} 
        />;
      case 'leaves':
        return <Leaves 
          role={currentUser.role} 
          currentUser={currentUser} 
          requests={leaveRequests} 
          onApply={(r) => {
            console.log('📝 New leave request:', r);
            const updatedLeaves = [r, ...leaveRequests];
            setLeaveRequests(updatedLeaves);
            
            // Save to localStorage immediately
            localStorage.setItem('ls_leave_requests', JSON.stringify(updatedLeaves));
            localStorage.setItem('last_update', Date.now().toString());
            
            // Trigger events via all channels
            supabaseService.triggerLeaveRequest(r.employeeId, r.employeeName, r.type, r.startDate, r.endDate);
            pusherService.trigger('leave-request', {
              employeeId: r.employeeId,
              employeeName: r.employeeName,
              leaveType: r.type,
              startDate: r.startDate,
              endDate: r.endDate,
              timestamp: new Date().toISOString()
            });
            
            console.log('✅ Leave request saved and broadcasted');
          }} 
          onAction={(id, s) => {
            console.log('✅ Leave action:', id, s);
            const request = leaveRequests.find(r => r.id === id);
            const updatedLeaves = leaveRequests.map(r => r.id === id ? {...r, status: s} : r);
            setLeaveRequests(updatedLeaves);
            
            // Save to localStorage immediately
            localStorage.setItem('ls_leave_requests', JSON.stringify(updatedLeaves));
            localStorage.setItem('last_update', Date.now().toString());
            
            // Trigger events via all channels
            if (request) {
              supabaseService.triggerLeaveAction(request.employeeId, request.employeeName, request.type, s);
              pusherService.trigger('leave-action', {
                employeeId: request.employeeId,
                employeeName: request.employeeName,
                leaveType: request.type,
                status: s,
                timestamp: new Date().toISOString()
              });
            }
            
            console.log('✅ Leave action saved and broadcasted');
          }} 
        />;
      case 'reports':
        return <Reports 
          employees={employees} 
          attendance={attendance} 
        />;
      case 'employees':
        return <Employees 
          employees={employees} 
          onAdd={(e) => setEmployees([...employees, e])}
          onUpdate={handleEmployeeUpdate} 
          onDelete={(id) => confirm("Delete staff?") && setEmployees(employees.filter(e => e.id !== id))} 
        />;
      default:
        return <div className="p-8 text-gray-400 font-bold italic">Module coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role={currentUser.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{activeTab}</span>
          </div>
          
          <div className="flex items-center space-x-8">
            <NotificationBell 
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
              onClearAll={clearAllNotifications}
              onNotificationClick={handleNotificationClick}
            />
            <div className="h-8 w-px bg-gray-100"></div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-black text-gray-900 leading-tight tracking-tight">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{currentUser.designation}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-100">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
