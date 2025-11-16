// FilterPanel.tsx
import React, { useState } from 'react';
import type { Camera, FilterOptions } from './types';
import { filterCameras, FILTER_PRESETS, applyPreset } from './filterSystem';

interface FilterPanelProps {
  cameras: Camera[];
  onFilterChange: (filtered: Camera[]) => void;
}

export function FilterPanel({ cameras, onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'ALL',
    waterMin: undefined,
    waterMax: undefined,
    lightMin: undefined,
    lightMax: undefined,
    maxSeverity: undefined,  // INVERTED: For showing worse conditions
    minSeverity: undefined,  // INVERTED: For showing better conditions
    searchId: ''
  });
  
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value === '' ? undefined : value };
    setFilters(newFilters);
    const filtered = filterCameras(cameras, newFilters);
    onFilterChange(filtered);
  };
  
  const applyQuickFilter = (presetKey: string) => {
    const preset = FILTER_PRESETS[presetKey];
    setFilters({ ...filters, ...preset.filters });
    const filtered = applyPreset(cameras, presetKey);
    onFilterChange(filtered);
  };
  
  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      status: 'ALL',
      waterMin: undefined,
      waterMax: undefined,
      lightMin: undefined,
      lightMax: undefined,
      maxSeverity: undefined,
      minSeverity: undefined,
      searchId: ''
    };
    setFilters(emptyFilters);
    onFilterChange(cameras);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4">🔍 Filters & Search</h3>
      
      {/* Quick Filters */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Quick Filters:</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => applyQuickFilter('criticalOnly')}
            className="text-sm py-2 px-3 bg-orange-100 hover:bg-orange-200 rounded"
          >
            🔴 Critical (L1-3)
          </button>
          <button 
            onClick={() => applyQuickFilter('immediateAction')}
            className="text-sm py-2 px-3 bg-red-100 hover:bg-red-200 rounded"
          >
            🚨 Immediate (L1-2)
          </button>
          <button 
            onClick={() => applyQuickFilter('safeCameras')}
            className="text-sm py-2 px-3 bg-green-100 hover:bg-green-200 rounded"
          >
            ✅ Safe (L4-5)
          </button>
          <button 
            onClick={() => applyQuickFilter('highWater')}
            className="text-sm py-2 px-3 bg-blue-100 hover:bg-blue-200 rounded"
          >
            💧 High Water
          </button>
          <button 
            onClick={() => applyQuickFilter('warningStatus')}
            className="text-sm py-2 px-3 bg-yellow-100 hover:bg-yellow-200 rounded"
          >
            ⚠️ Warning Status
          </button>
          <button 
            onClick={() => applyQuickFilter('highLight')}
            className="text-sm py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded"
          >
            🌑 Dark Pipes
          </button>
        </div>
      </div>
      
      {/* Camera ID Search */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Search Camera ID:</label>
        <input 
          type="text"
          value={filters.searchId || ''}
          onChange={(e) => handleFilterChange('searchId', e.target.value)}
          placeholder="Enter camera ID..."
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Status Filter */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Camera Status:</label>
        <select 
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="ALL">All Statuses</option>
          <option value="OK">OK</option>
          <option value="LOWLIGHT">LOWLIGHT</option>
          <option value="WARNING">WARNING</option>
        </select>
      </div>
      
      {/* Water Level Filter */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          Water Level: {filters.waterMin ? `${(filters.waterMin * 100).toFixed(0)}%` : '0%'} - 
          {filters.waterMax ? ` ${(filters.waterMax * 100).toFixed(0)}%` : ' 100%'}
        </label>
        <div className="flex gap-2">
          <input 
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filters.waterMin || 0}
            onChange={(e) => handleFilterChange('waterMin', parseFloat(e.target.value))}
            className="flex-1"
          />
          <input 
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filters.waterMax || 1}
            onChange={(e) => handleFilterChange('waterMax', parseFloat(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>
      
      {/* Light Intensity Filter */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          Light Intensity: {filters.lightMin?.toFixed(2) || '0.00'} - 
          {filters.lightMax?.toFixed(2) || 'Max'}
          <span className="text-xs text-gray-500 ml-2">(higher = darker pipe)</span>
        </label>
        <div className="flex gap-2">
          <input 
            type="number"
            step="0.1"
            placeholder="Min"
            value={filters.lightMin || ''}
            onChange={(e) => handleFilterChange('lightMin', parseFloat(e.target.value))}
            className="flex-1 p-2 border rounded"
          />
          <input 
            type="number"
            step="0.1"
            placeholder="Max"
            value={filters.lightMax || ''}
            onChange={(e) => handleFilterChange('lightMax', parseFloat(e.target.value))}
            className="flex-1 p-2 border rounded"
          />
        </div>
      </div>
      
      {/* Severity Level Filter (INVERTED) */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          Severity Level:
          <span className="text-xs text-gray-500 ml-2">(5=best, 1=worst)</span>
        </label>
        <select 
          value={filters.maxSeverity || ''}
          onChange={(e) => handleFilterChange('maxSeverity', parseInt(e.target.value) || undefined)}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="">Show All Levels</option>
          <option value="1">Level 1 Only (Critical)</option>
          <option value="2">Levels 1-2 (Severe+)</option>
          <option value="3">Levels 1-3 (Moderate+)</option>
        </select>
        
        <select 
          value={filters.minSeverity || ''}
          onChange={(e) => handleFilterChange('minSeverity', parseInt(e.target.value) || undefined)}
          className="w-full p-2 border rounded"
        >
          <option value="">Show All Levels</option>
          <option value="4">Levels 4-5 (Minor/Safe)</option>
          <option value="5">Level 5 Only (Safe)</option>
        </select>
      </div>
      
      {/* Clear Button */}
      <button 
        onClick={clearFilters}
        className="w-full bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded"
      >
        Clear All Filters
      </button>
      
      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
        <strong>📘 Inverted Scale:</strong>
        <div className="mt-1 space-y-1">
          <div>🔴 Level 1 = Critical (worst)</div>
          <div>🚨 Level 2 = Severe</div>
          <div>⚠️ Level 3 = Moderate</div>
          <div>⚡ Level 4 = Minor</div>
          <div>✅ Level 5 = Safe (best)</div>
        </div>
      </div>
    </div>
  );
}