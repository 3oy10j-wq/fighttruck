'use client';

import type { Report } from '@/lib/types';

interface ReportCardProps {
  report: Report;
  compact?: boolean;
  onDelete?: (reportId: string) => void;
  canDelete?: boolean;
}

function timeAgo(timestamp: unknown): string {
  if (!timestamp) return '不明';

  const date = typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp
    ? (timestamp as { toDate(): Date }).toDate()
    : new Date(timestamp as string | number);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return '今';
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}日前`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}ヶ月前`;

  return date.toLocaleDateString('ja-JP');
}

export default function ReportCard({
  report,
  compact = false,
  onDelete,
  canDelete = false,
}: ReportCardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${compact ? 'p-3' : 'p-4'} space-y-2`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
            {report.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} text-gray-900`}>
              {report.userName || '匿名'}
            </p>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
              {timeAgo(report.timestamp)}
            </p>
          </div>
        </div>
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(report.id)}
            className="text-sm text-red-600 hover:text-red-800 font-semibold"
          >
            削除
          </button>
        )}
      </div>

      {/* Ratings */}
      <div className={`space-y-2 ${compact ? 'text-xs' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">駐車の容易さ:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= report.ratings.parking_ease
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">清潔さ:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= report.ratings.cleanliness
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">総合満足度:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= report.ratings.overall_satisfaction
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Can Park Badge */}
      <div className="flex gap-2">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
            report.ratings.can_park
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {report.ratings.can_park ? '✓ 駐車可' : '✗ 駐車不可'}
        </span>
      </div>

      {/* Comment */}
      {report.comment && (
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 whitespace-pre-wrap`}>
          {report.comment}
        </p>
      )}

      {/* Image */}
      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt="レポート画像"
          className="w-full h-48 object-cover rounded-lg"
        />
      )}
    </div>
  );
}
