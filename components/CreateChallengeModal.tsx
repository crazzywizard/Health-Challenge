'use client';

import { useState, FormEvent } from 'react';
import { CreateChallengeInput, CreateRuleInput } from '@/app/types';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateChallengeModal({ isOpen, onClose, onSuccess }: CreateChallengeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState('75');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [rules, setRules] = useState<CreateRuleInput[]>([
    { description: '', rule_type: 'boolean', order_index: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddRule = () => {
    setRules([...rules, { description: '', rule_type: 'boolean', order_index: rules.length }]);
  };

  const handleRemoveRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  const handleRuleChange = (index: number, field: keyof CreateRuleInput, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Challenge name is required');
      return;
    }

    if (!durationDays || parseInt(durationDays) < 1) {
      setError('Duration must be at least 1 day');
      return;
    }

    const validRules = rules.filter(r => r.description.trim());
    if (validRules.length === 0) {
      setError('At least one rule is required');
      return;
    }

    setLoading(true);

    try {
      const input: CreateChallengeInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        duration_days: parseInt(durationDays),
        start_date: startDate,
        rules: validRules.map((rule, index) => ({
          ...rule,
          order_index: index,
        })),
      };

      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create challenge');
      }

      // Reset form
      setName('');
      setDescription('');
      setDurationDays('75');
      setStartDate(new Date().toISOString().split('T')[0]);
      setRules([{ description: '', rule_type: 'boolean', order_index: 0 }]);
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Create New Challenge</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-border transition-colors flex items-center justify-center"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Name */}
          <div>
            <label htmlFor="name">Challenge Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 75 Hard, 30-Day Fitness"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this challenge about?"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Duration and Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration">Duration (Days) *</label>
              <input
                id="duration"
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="startDate">Start Date *</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Rules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="mb-0">Rules *</label>
              <button
                type="button"
                onClick={handleAddRule}
                className="btn btn-secondary text-sm py-2 px-3"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Rule
              </button>
            </div>

            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rule.description}
                    onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                    placeholder={`Rule ${index + 1} (e.g., No sugar, 10k steps, 1 gallon water)`}
                    disabled={loading}
                    className="flex-1"
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(index)}
                      className="w-10 h-10 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors flex items-center justify-center"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 animate-slide-down">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Challenge'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
