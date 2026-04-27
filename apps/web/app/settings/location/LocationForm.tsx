'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, AlertCircle, CheckCircle2, Trash2, Search, ArrowLeft } from 'lucide-react';
import { resolveLocation, saveLocation, clearLocation } from './actions';
import type { ResolvedLocationPreview } from './actions';

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

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-300 mb-1.5">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600',
        'focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500',
        'transition-colors',
        props.className ?? '',
      ].join(' ')}
    />
  );
}

// ---------------------------------------------------------------------------
// Saved location display (read state)
// ---------------------------------------------------------------------------

function SavedLocationCard({
  displayName,
  latitude,
  longitude,
  onEdit,
  onClear,
  isClearing,
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
// Resolved preview card (confirm step)
// ---------------------------------------------------------------------------

function ResolvedPreviewCard({
  preview,
  onConfirm,
  onSearchAgain,
  isSaving,
}: {
  preview: ResolvedLocationPreview;
  onConfirm: () => void;
  onSearchAgain: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="rounded-[16px] border border-indigo-700/40 bg-indigo-950/20 p-4">
      <p className="text-xs font-medium text-indigo-400 mb-2">Location found</p>
      <p className="text-sm font-semibold text-slate-100 break-words">{preview.displayName}</p>
      <p className="mt-1 text-xs text-slate-500 tabular-nums">
        {formatCoords(preview.latitude, preview.longitude)}
      </p>
      {preview.rawInput.toLowerCase() !== preview.displayName.toLowerCase() && (
        <p className="mt-1.5 text-xs text-slate-500">
          Resolved from <span className="text-slate-400">"{preview.rawInput}"</span>
        </p>
      )}
      <div className="mt-4 flex items-center gap-2">
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
          onClick={onSearchAgain}
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

export function LocationForm({ current }: Props) {
  const router = useRouter();
  const [isLooking, startLookupTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [isClearing, startClearTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ResolvedLocationPreview | null>(null);

  // Editing state: true when user clicks "Change location" on a saved location
  const [isEditing, setIsEditing] = useState(!current?.displayName);
  const [rawInput, setRawInput] = useState(current?.rawInput ?? '');
  const [precisionMode, setPrecisionMode] = useState<'exact' | 'approximate'>(
    (current?.precisionMode as 'exact' | 'approximate') ?? 'approximate',
  );

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPreview(null);
    startLookupTransition(async () => {
      const result = await resolveLocation({ rawInput, precisionMode });
      if (!result.ok) {
        setError(result.error);
      } else {
        setPreview(result.preview);
      }
    });
  }

  function handleConfirm() {
    if (!preview) return;
    setError(null);
    startSaveTransition(async () => {
      const result = await saveLocation(preview);
      if (!result.ok) {
        setError(result.error);
      } else {
        setPreview(null);
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  function handleSearchAgain() {
    setPreview(null);
    setError(null);
  }

  function handleClear() {
    setError(null);
    startClearTransition(async () => {
      const result = await clearLocation();
      if (!result.ok) {
        setError(result.error);
      } else {
        setRawInput('');
        setPrecisionMode('approximate');
        setPreview(null);
        setIsEditing(true);
        router.refresh();
      }
    });
  }

  function handleChangeLocation() {
    setPreview(null);
    setError(null);
    setIsEditing(true);
  }

  const isWorking = isLooking || isSaving || isClearing;

  return (
    <div className="max-w-md">
      {/* Saved state */}
      {current?.displayName && !isEditing && (
        <SavedLocationCard
          displayName={current.displayName}
          latitude={current.latitude ?? ''}
          longitude={current.longitude ?? ''}
          onEdit={handleChangeLocation}
          onClear={handleClear}
          isClearing={isClearing}
        />
      )}

      {/* Search form */}
      {isEditing && !preview && (
        <form onSubmit={handleLookup} className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="rawInput">Town, postcode, or Eircode</FieldLabel>
            <TextInput
              id="rawInput"
              type="text"
              value={rawInput}
              onChange={(e) => { setRawInput(e.target.value); setError(null); }}
              placeholder="e.g. Cork, D02 XY45, or Galway"
              autoComplete="off"
              disabled={isWorking}
            />
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Used to fetch weather and solar context. Never shared or used to identify your street address.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Location precision</p>
            <div className="flex flex-col gap-2">
              {(
                [
                  { value: 'approximate', label: 'Approximate', description: 'Store only a town or area name — better for privacy' },
                  { value: 'exact', label: 'Exact', description: 'Store the full resolved address' },
                ] as const
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
                    disabled={isWorking}
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

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isWorking || !rawInput.trim()}
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/50 bg-indigo-600/80 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLooking ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              Find location
            </button>
            {current?.displayName && (
              <button
                type="button"
                onClick={() => { setIsEditing(false); setError(null); setPreview(null); }}
                disabled={isWorking}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Confirmation step */}
      {isEditing && preview && (
        <div className="flex flex-col gap-4">
          <ResolvedPreviewCard
            preview={preview}
            onConfirm={handleConfirm}
            onSearchAgain={handleSearchAgain}
            isSaving={isSaving}
          />
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
