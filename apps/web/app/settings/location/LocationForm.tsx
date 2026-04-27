'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Loader2, AlertCircle, CheckCircle2, Trash2, Search, ArrowLeft, X,
} from 'lucide-react';
import { searchLocations, saveLocation, clearLocation } from './actions';
import type { LocationCandidate } from './actions';

type Props = {
  current: {
    rawInput: string | null;
    displayName: string | null;
    precisionMode: string | null;
    latitude: string | null;
    longitude: string | null;
  } | null;
};

function formatCoords(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

// ---------------------------------------------------------------------------
// Saved location card (read state)
// ---------------------------------------------------------------------------

function SavedLocationCard({
  displayName, latitude, longitude, onEdit, onClear, isClearing,
}: {
  displayName: string;
  latitude: string;
  longitude: string;
  onEdit: () => void;
  onClear: () => void;
  isClearing: boolean;
}) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  return (
    <div className="rounded-[16px] border border-emerald-800/30 bg-[#0d1f18] p-4 mb-6">
      <div className="flex items-start gap-2.5">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-emerald-400 mb-0.5">Location saved</p>
          <p className="text-sm font-semibold text-slate-100 break-words">{displayName}</p>
          {!isNaN(lat) && !isNaN(lon) && (
            <p className="mt-1 text-xs text-slate-500 tabular-nums">{formatCoords(lat, lon)}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
        >
          Change location
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={isClearing}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-red-800/60 hover:text-red-400 disabled:opacity-50 transition-colors"
        >
          {isClearing ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
          Remove
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Selected candidate confirmation card
// ---------------------------------------------------------------------------

function SelectedCandidateCard({
  candidate, precisionMode, onConfirm, onBack, isSaving, error,
}: {
  candidate: LocationCandidate;
  precisionMode: 'exact' | 'approximate';
  onConfirm: () => void;
  onBack: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const storedName = precisionMode === 'approximate' ? candidate.name : candidate.contextLabel;
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[16px] border border-indigo-700/40 bg-indigo-950/20 p-4">
        <p className="text-xs font-medium text-indigo-400 mb-1">Location found</p>
        <p className="text-sm font-semibold text-slate-100">{candidate.contextLabel}</p>
        <p className="mt-1 text-xs text-slate-500 tabular-nums">
          {formatCoords(candidate.latitude, candidate.longitude)}
        </p>
        {storedName !== candidate.contextLabel && (
          <p className="mt-2 text-xs text-slate-500">
            Saved as:{' '}
            <span className="text-slate-400 font-medium">"{storedName}"</span>
            <span className="text-slate-600 ml-1">(approximate mode)</span>
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/50 bg-indigo-600/80 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          Save this location
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft size={11} />
          Search again
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 320;
const MIN_QUERY_LENGTH = 2;

export function LocationForm({ current }: Props) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();
  const [isClearing, startClearTransition] = useTransition();

  const [isEditing, setIsEditing] = useState(!current?.displayName);
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<LocationCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<LocationCandidate | null>(null);
  const [precisionMode, setPrecisionMode] = useState<'exact' | 'approximate'>(
    (current?.precisionMode as 'exact' | 'approximate') ?? 'approximate',
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setCandidates([]);
      setDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const result = await searchLocations(query);
      setIsSearching(false);
      if (result.ok) {
        setCandidates(result.candidates);
        setDropdownOpen(result.candidates.length > 0);
      } else {
        setCandidates([]);
        setDropdownOpen(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelect(candidate: LocationCandidate) {
    setSelected(candidate);
    setDropdownOpen(false);
    setQuery('');
    setSaveError(null);
  }

  function handleSave() {
    if (!selected) return;
    setSaveError(null);
    startSaveTransition(async () => {
      const result = await saveLocation({ candidate: selected, precisionMode });
      if (!result.ok) {
        setSaveError(result.error);
      } else {
        setSelected(null);
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  function handleClear() {
    setClearError(null);
    startClearTransition(async () => {
      const result = await clearLocation();
      if (!result.ok) {
        setClearError(result.error);
      } else {
        setQuery('');
        setSelected(null);
        setCandidates([]);
        setIsEditing(true);
        router.refresh();
      }
    });
  }

  function handleStartEditing() {
    setSelected(null);
    setQuery('');
    setCandidates([]);
    setSaveError(null);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleCancelEdit() {
    setSelected(null);
    setQuery('');
    setCandidates([]);
    setSaveError(null);
    setIsEditing(false);
  }

  return (
    <div className="max-w-md">
      {/* Saved state */}
      {current?.displayName && !isEditing && (
        <SavedLocationCard
          displayName={current.displayName}
          latitude={current.latitude ?? ''}
          longitude={current.longitude ?? ''}
          onEdit={handleStartEditing}
          onClear={handleClear}
          isClearing={isClearing}
        />
      )}
      {clearError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">{clearError}</p>
        </div>
      )}

      {/* Search form */}
      {isEditing && !selected && (
        <div className="flex flex-col gap-5">
          {/* Typeahead input */}
          <div>
            <label htmlFor="location-search" className="block text-xs font-medium text-slate-300 mb-1.5">
              Town, city, or postcode
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                {isSearching
                  ? <Loader2 size={13} className="animate-spin text-slate-500" />
                  : <Search size={13} className="text-slate-500" />
                }
              </div>
              <input
                ref={inputRef}
                id="location-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => candidates.length > 0 && setDropdownOpen(true)}
                placeholder="e.g. Blackrock, Cork, Galway…"
                autoComplete="off"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pl-8 pr-8 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setCandidates([]); setDropdownOpen(false); inputRef.current?.focus(); }}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-slate-400 transition-colors"
                  tabIndex={-1}
                >
                  <X size={13} />
                </button>
              )}

              {/* Dropdown */}
              {dropdownOpen && candidates.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-20 mt-1 w-full rounded-xl border border-slate-700 bg-[#111b2b] shadow-[0_8px_30px_rgba(2,6,23,0.4)] overflow-hidden"
                >
                  {candidates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSelect(c); }}
                      className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-slate-800/60 transition-colors border-b border-slate-800/60 last:border-0"
                    >
                      <MapPin size={12} className="mt-0.5 shrink-0 text-slate-500" />
                      <span className="text-sm text-slate-200">{c.contextLabel}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No results hint */}
              {dropdownOpen && candidates.length === 0 && !isSearching && query.trim().length >= MIN_QUERY_LENGTH && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-700 bg-[#111b2b] px-4 py-3 text-xs text-slate-500">
                  No locations found — try a different search term.
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Used for weather and solar context only. Not shared.
            </p>
          </div>

          {/* Precision mode */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">What name to store</p>
            <div className="flex flex-col gap-2">
              {(
                [
                  {
                    value: 'approximate' as const,
                    label: 'Town only',
                    description: 'Stores just the town name — e.g. "Blackrock"',
                  },
                  {
                    value: 'exact' as const,
                    label: 'Full label',
                    description: 'Stores the full resolved label — e.g. "Blackrock, Leinster, Ireland"',
                  },
                ]
              ).map(({ value, label, description }) => (
                <label
                  key={value}
                  className={[
                    'flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                    precisionMode === value
                      ? 'border-indigo-500/50 bg-indigo-600/10'
                      : 'border-slate-700 bg-slate-900/40 hover:border-slate-600',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="precisionMode"
                    value={value}
                    checked={precisionMode === value}
                    onChange={() => setPrecisionMode(value)}
                    className="mt-0.5 accent-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {current?.displayName && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="self-start text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Confirmation step */}
      {isEditing && selected && (
        <SelectedCandidateCard
          candidate={selected}
          precisionMode={precisionMode}
          onConfirm={handleSave}
          onBack={() => { setSelected(null); setTimeout(() => inputRef.current?.focus(), 50); }}
          isSaving={isSaving}
          error={saveError}
        />
      )}
    </div>
  );
}
