import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface SyncStatusProps {
  status: 'idle' | 'syncing' | 'error';
  lastSynced?: string;
  compact?: boolean;
}

export function SyncStatus({ status, lastSynced, compact = false }: SyncStatusProps) {
  const getIcon = () => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <CheckCircle className="w-3 h-3" />;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'syncing':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getText = () => {
    if (compact) return '';
    
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Error';
      default:
        return lastSynced ? `Last synced ${new Date(lastSynced).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        })}` : 'Synced';
    }
  };

  return (
    <Badge variant={getVariant()} className="text-xs">
      {getIcon()}
      {!compact && <span className="ml-1">{getText()}</span>}
    </Badge>
  );
}