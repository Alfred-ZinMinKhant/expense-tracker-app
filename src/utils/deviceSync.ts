import { v4 as uuidv4 } from "uuid";

export interface SyncData {
  userId: string;
  deviceId: string;
  lastSync: string;
  expenses: any[];
}

export class DeviceSyncManager {
  private static readonly USER_ID_KEY = "expense_tracker_user_id";
  private static readonly DEVICE_ID_KEY = "expense_tracker_device_id";
  private static readonly LAST_SYNC_KEY = "expense_tracker_last_sync";
  private static readonly LOCAL_EXPENSES_KEY = "expenses";

  static initializeDevice(): { userId: string; deviceId: string } {
    let userId = localStorage.getItem(this.USER_ID_KEY);
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);

    if (!userId) {
      userId = uuidv4();
      localStorage.setItem(this.USER_ID_KEY, userId);
    }

    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }

    return { userId, deviceId };
  }

  static getUserId(): string {
    return (
      localStorage.getItem(this.USER_ID_KEY) || this.initializeDevice().userId
    );
  }

  static getDeviceId(): string {
    return (
      localStorage.getItem(this.DEVICE_ID_KEY) ||
      this.initializeDevice().deviceId
    );
  }

  static getLastSync(): string {
    return localStorage.getItem(this.LAST_SYNC_KEY) || "";
  }

  static setLastSync(timestamp: string): void {
    localStorage.setItem(this.LAST_SYNC_KEY, timestamp);
  }

  static getLocalExpenses(): any[] {
    const saved = localStorage.getItem(this.LOCAL_EXPENSES_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static setLocalExpenses(expenses: any[]): void {
    localStorage.setItem(this.LOCAL_EXPENSES_KEY, JSON.stringify(expenses));
  }

  static async syncWithCloud(cloudExpenses: any[]): Promise<void> {
    const localExpenses = this.getLocalExpenses();

    // Merge local and cloud data, prioritizing newer entries
    const merged = this.mergeExpenses(localExpenses, cloudExpenses);

    // Update both local and cloud
    this.setLocalExpenses(merged);

    // Note: Cloud update will be handled by the API call
    this.setLastSync(new Date().toISOString());
  }

  static mergeExpenses(local: any[], cloud: any[]): any[] {
    const expenseMap = new Map();

    // Add all cloud expenses first
    cloud.forEach((expense) => {
      expenseMap.set(expense.id, expense);
    });

    // Add local expenses, overwriting if local is newer
    local.forEach((expense) => {
      const existing = expenseMap.get(expense.id);
      if (!existing || new Date(expense.date) > new Date(existing.date)) {
        expenseMap.set(expense.id, expense);
      }
    });

    return Array.from(expenseMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static async generateSyncCode(): Promise<string> {
    const userId = this.getUserId();
    const deviceId = this.getDeviceId();

    // Simple encoding for sync code
    const code = btoa(`${userId}:${deviceId}:${Date.now()}`).substring(0, 8);
    return code;
  }

  static async linkWithSyncCode(code: string): Promise<boolean> {
    try {
      const decoded = atob(code);
      const [userId] = decoded.split(":");

      if (userId) {
        localStorage.setItem(this.USER_ID_KEY, userId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
