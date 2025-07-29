import React, { useState, useEffect } from "react";
import { DeviceSyncManager } from "../utils/deviceSync";
import { CloudSyncManager } from "../utils/cloudSync";
import "./SyncManager.css";

interface SyncManagerProps {
  onSyncComplete: () => void;
}

const SyncManager: React.FC<SyncManagerProps> = ({ onSyncComplete }) => {
  const [syncCode, setSyncCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    const lastSyncTime = DeviceSyncManager.getLastSync();
    setLastSync(lastSyncTime);

    // Initialize device on mount
    DeviceSyncManager.initializeDevice();
  }, []);

  const handleGenerateCode = async () => {
    const code = await DeviceSyncManager.generateSyncCode();
    setSyncCode(code);
  };

  const handleLinkDevice = async () => {
    if (!inputCode.trim()) return;

    setIsSyncing(true);
    try {
      const success = await DeviceSyncManager.linkWithSyncCode(
        inputCode.trim()
      );
      if (success) {
        await CloudSyncManager.syncAllExpenses();
        setLastSync(new Date().toISOString());
        setInputCode("");
        setShowSyncModal(false);
        onSyncComplete();
      } else {
        alert("Invalid sync code. Please try again.");
      }
    } catch (error) {
      console.error("Error linking device:", error);
      alert("Failed to link device. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await CloudSyncManager.syncAllExpenses();
      setLastSync(new Date().toISOString());
      onSyncComplete();
    } catch (error) {
      console.error("Error syncing:", error);
      alert("Failed to sync. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="sync-manager">
      <div className="sync-controls">
        <button
          className="btn btn-primary"
          onClick={handleManualSync}
          disabled={isSyncing}
        >
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setShowSyncModal(true)}
        >
          Link Device
        </button>

        <button className="btn btn-info" onClick={handleGenerateCode}>
          Get Sync Code
        </button>
      </div>

      {lastSync && (
        <div className="sync-info">
          <small>Last synced: {new Date(lastSync).toLocaleString()}</small>
        </div>
      )}

      {syncCode && (
        <div className="sync-code-display">
          <h4>Your Sync Code:</h4>
          <div className="code-box">
            <code>{syncCode}</code>
            <button
              className="btn-copy"
              onClick={() => navigator.clipboard.writeText(syncCode)}
            >
              Copy
            </button>
          </div>
          <small>Share this code with another device to sync your data</small>
        </div>
      )}

      {showSyncModal && (
        <div className="modal-overlay">
          <div className="modal sync-modal">
            <h3>Link Another Device</h3>
            <p>Enter the sync code from your other device:</p>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter sync code"
              maxLength={8}
              className="sync-input"
            />
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleLinkDevice}
                disabled={isSyncing || !inputCode.trim()}
              >
                {isSyncing ? "Linking..." : "Link Device"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSyncModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncManager;
