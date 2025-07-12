// ABOUTME: Progress feedback component for bulk operations on multiple elements
// ABOUTME: Shows progress bar and status for operations like duplicate, delete, style apply

import React from 'react';

interface BulkOperationProgressProps {
  isVisible: boolean;
  operation: string;
  current: number;
  total: number;
  itemName: string;
}

export const BulkOperationProgress: React.FC<BulkOperationProgressProps> = ({
  isVisible,
  operation,
  current,
  total,
  itemName
}) => {
  if (!isVisible || total === 0) return null;

  const percentage = Math.round((current / total) * 100);
  const isComplete = current >= total;

  return (
    <div className="bulk-operation-progress">
      <div className="bulk-operation-progress__backdrop" />
      <div className="bulk-operation-progress__modal">
        <div className="bulk-operation-progress__header">
          <h3>{operation}</h3>
          {!isComplete && (
            <div className="bulk-operation-progress__cancel">
              <button type="button" aria-label="Annuler l'opération">
                ×
              </button>
            </div>
          )}
        </div>
        
        <div className="bulk-operation-progress__content">
          <div className="bulk-operation-progress__status">
            {isComplete ? (
              <span className="status-complete">✓ Terminé</span>
            ) : (
              <span>
                {operation} {current} sur {total} {itemName}...
              </span>
            )}
          </div>
          
          <div className="bulk-operation-progress__bar">
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="progress-text">
              {percentage}%
            </div>
          </div>
          
          {isComplete && (
            <div className="bulk-operation-progress__actions">
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .bulk-operation-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bulk-operation-progress__backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .bulk-operation-progress__modal {
          position: relative;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          min-width: 400px;
          max-width: 500px;
          padding: 0;
          overflow: hidden;
        }

        .bulk-operation-progress__header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bulk-operation-progress__header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .bulk-operation-progress__cancel button {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .bulk-operation-progress__cancel button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .bulk-operation-progress__content {
          padding: 20px 24px;
        }

        .bulk-operation-progress__status {
          margin-bottom: 16px;
          font-size: 14px;
          color: #6b7280;
        }

        .status-complete {
          color: #059669;
          font-weight: 500;
        }

        .bulk-operation-progress__bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-track {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a855f7);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          min-width: 35px;
          text-align: right;
        }

        .bulk-operation-progress__actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }

        .btn-primary {
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #7c3aed;
        }
      `}</style>
    </div>
  );
};