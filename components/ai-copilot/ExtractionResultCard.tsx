'use client';

import React, { useState } from 'react';
import { Check, X, Edit2, AlertTriangle, CheckCircle, AlertCircle as AlertCircleIcon, MapPin, Clock, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractionResult } from '@/lib/ai/documentExtraction';
import { getConfidenceLevel, parseMarionCountyCaseNumber, isMarionCountyCase, calculateMarionCountyTimeline } from '@/lib/ai/documentExtraction';

export interface ExtractionResultCardProps {
  result: ExtractionResult;
  onConfirm: (data: Partial<ExtractionResult>) => void;
  onReject: () => void;
  className?: string;
}

interface EditableField {
  key: keyof ExtractionResult;
  label: string;
  value: string | undefined;
  confidence?: number;
  editable: boolean;
}

export const ExtractionResultCard: React.FC<ExtractionResultCardProps> = ({
  result,
  onConfirm,
  onReject,
  className,
}) => {
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);

  // Get Marion County information if applicable
  const marionCountyInfo = result.caseNumber && isMarionCountyCase(result.caseNumber) 
    ? parseMarionCountyCaseNumber(result.caseNumber) 
    : null;

  // Calculate timeline if we have Marion County case and notice date
  const timelineInfo = marionCountyInfo && result.hearingDate 
    ? calculateMarionCountyTimeline(result.hearingDate, marionCountyInfo.caseType)
    : null;

  // Build editable fields list
  const fields: EditableField[] = [
    {
      key: 'caseNumber',
      label: 'Case Number',
      value: result.caseNumber,
      confidence: result.confidence?.caseNumber,
      editable: true,
    },
    {
      key: 'hearingDate',
      label: 'Hearing Date',
      value: result.hearingDate,
      confidence: result.confidence?.hearingDate,
      editable: true,
    },
    {
      key: 'courtName',
      label: 'Court Name',
      value: result.courtName,
      confidence: result.confidence?.courtName,
      editable: true,
    },
    {
      key: 'jurisdiction',
      label: 'Jurisdiction',
      value: result.jurisdiction,
      confidence: result.confidence?.jurisdiction,
      editable: true,
    },
    {
      key: 'caseType',
      label: 'Case Type',
      value: result.caseType,
      confidence: result.confidence?.caseType,
      editable: true,
    },
  ];

  const handleFieldEdit = (fieldKey: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleConfirm = () => {
    // Merge original values with edited values
    const finalData: Partial<ExtractionResult> = {
      caseNumber: editedValues.caseNumber ?? result.caseNumber,
      hearingDate: editedValues.hearingDate ?? result.hearingDate,
      courtName: editedValues.courtName ?? result.courtName,
      jurisdiction: editedValues.jurisdiction ?? result.jurisdiction,
      caseType: editedValues.caseType ?? result.caseType,
      parties: result.parties,
    };

    onConfirm(finalData);
  };

  const getConfidenceIndicator = (confidence?: number) => {
    if (!confidence) return null;

    const level = getConfidenceLevel(confidence);
    const percentage = Math.round(confidence * 100);

    const styles = {
      high: 'text-green-700 bg-green-100',
      medium: 'text-yellow-700 bg-yellow-100',
      low: 'text-red-700 bg-red-100',
    };

    const icons = {
      high: <CheckCircle className="w-3 h-3" />,
      medium: <AlertTriangle className="w-3 h-3" />,
      low: <AlertCircleIcon className="w-3 h-3" />,
    };

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', styles[level])}>
        {icons[level]}
        {percentage}%
      </span>
    );
  };

  const overallConfidence = result.confidence?.overall ?? 0;
  const overallLevel = getConfidenceLevel(overallConfidence);

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Document Extraction Results
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Review and edit the extracted information below
            </p>
          </div>
          <div className="flex items-center gap-1">
            {getConfidenceIndicator(overallConfidence)}
          </div>
        </div>
      </div>

      {/* Marion County Context */}
      {marionCountyInfo && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">Marion County Court Information</h4>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
                <p><strong>Court:</strong> {marionCountyInfo.courtInfo.name}</p>
                <p><strong>Jurisdiction:</strong> {marionCountyInfo.fullJurisdiction}</p>
                <p><strong>Case Type:</strong> {marionCountyInfo.caseType === 'eviction' ? 'Eviction' : 'Small Claims'}</p>
                <p><strong>Township:</strong> {marionCountyInfo.township}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{marionCountyInfo.courtInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{marionCountyInfo.courtInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{marionCountyInfo.courtInfo.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Information */}
      {timelineInfo && marionCountyInfo && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-200">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900">Marion County Timeline</h4>
              <div className="text-sm text-green-700 mt-1 space-y-1">
                <p><strong>Response Due:</strong> {timelineInfo.responseDue.toLocaleDateString()}</p>
                <p><strong>Hearing Scheduled:</strong> {timelineInfo.hearingScheduled.toLocaleDateString()}</p>
                {timelineInfo.writExecution && (
                  <p><strong>Writ Execution:</strong> {timelineInfo.writExecution.toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted fields */}
      <div className="p-4 space-y-3">
        {fields.map(field => {
          const currentValue = editedValues[field.key] ?? field.value;
          const isEditing = editingField === field.key;

          if (!currentValue && !isEditing) {
            return null; // Don't show fields with no value
          }

          return (
            <div key={field.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.confidence !== undefined && getConfidenceIndicator(field.confidence)}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedValues[field.key] ?? field.value ?? ''}
                    onChange={(e) => handleFieldEdit(field.key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingField(null);
                      }
                      if (e.key === 'Escape') {
                        setEditedValues(prev => {
                          const newValues = { ...prev };
                          delete newValues[field.key];
                          return newValues;
                        });
                        setEditingField(null);
                      }
                    }}
                  />
                  <button
                    onClick={() => setEditingField(null)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    aria-label="Save edit"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditedValues(prev => {
                        const newValues = { ...prev };
                        delete newValues[field.key];
                        return newValues;
                      });
                      setEditingField(null);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    aria-label="Cancel edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                    {currentValue || 'Not found'}
                  </div>
                  {field.editable && (
                    <button
                      onClick={() => setEditingField(field.key)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      aria-label={`Edit ${field.label}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Parties section (if available) */}
        {result.parties && (result.parties.plaintiff || result.parties.defendant) && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Parties
            </div>
            <div className="space-y-2">
              {result.parties.plaintiff && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Plaintiff:</span>{' '}
                  <span className="text-gray-900">{result.parties.plaintiff}</span>
                </div>
              )}
              {result.parties.defendant && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Defendant:</span>{' '}
                  <span className="text-gray-900">{result.parties.defendant}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw text summary */}
        {result.rawText && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Document Summary
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
              {result.rawText}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <X className="w-4 h-4" />
            Reject
          </span>
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Confirm & Use
          </span>
        </button>
      </div>

      {/* Low confidence warning */}
      {overallLevel === 'low' && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Low Confidence Extraction</p>
              <p className="text-sm text-yellow-700 mt-1">
                The document quality or format made it difficult to extract information accurately.
                Please review and correct the fields above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractionResultCard;
