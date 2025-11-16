// FilterPanel.tsx
import React, { useState } from 'react';
import type { Camera, FilterOptions } from './types';
import { filterCameras, FILTER_PRESETS, getPresetsByCategory, KEYWORD_CATEGORIES } from './filterSystem';

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
    maxSeverity: undefined,
    minSeverity: undefined,
    searchId: '',
    descriptionKeywords: [],
    hasUrgencyKeywords: false,
    hasObstructionKeywords: false,
    hasStructuralKeywords: false,
    hasBuildupKeywords: false,
    hasFlowKeywords: false,
    hasBioKeywords: false,
    abnormalWater: false,
    multiFactor: false,
    unreliableSensors: false,
    highRisk: false
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showKeywordFilters, setShowKeywordFilters] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value === '' ? undefined : value };
    setFilters(newFilters);
    const filtered = filterCameras(cameras, newFilters);
    onFilterChange(filtered);
  };
  
  const applyQuickFilter = (presetKey: string) => {
    const preset = FILTER_PRESETS[presetKey];
    const newFilters = { ...filters, ...preset.filters };
    setFilters(newFilters);
    const filtered = filterCameras(cameras, newFilters);
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
      searchId: '',
      descriptionKeywords: [],
      hasUrgencyKeywords: false,
      hasObstructionKeywords: false,
      hasStructuralKeywords: false,
      hasBuildupKeywords: false,
      hasFlowKeywords: false,
      hasBioKeywords: false,
      abnormalWater: false,
      multiFactor: false,
      unreliableSensors: false,
      highRisk: false
    };
    setFilters(emptyFilters);
    onFilterChange(cameras);
  };
  
  const addCustomKeyword = () => {
    if (customKeyword.trim()) {
      const newKeywords = [...(filters.descriptionKeywords || []), customKeyword.trim()];
      handleFilterChange('descriptionKeywords', newKeywords);
      setCustomKeyword('');
    }
  };
  
  const removeCustomKeyword = (keyword: string) => {
    const newKeywords = (filters.descriptionKeywords || []).filter(k => k !== keyword);
    handleFilterChange('descriptionKeywords', newKeywords);
  };
  
  const presetCategories = getPresetsByCategory();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-4">🔍 Filters & Search</h3>
      
      {/* Quick Filters - Critical Areas */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">🚨 Critical Areas:</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => applyQuickFilter('immediateAction')}
            className="text-sm py-2 px-3 bg-red-100 hover:bg-red-200 rounded"
          >
            🔴 Level 1-2
          </button>
          <button 
            onClick={() => applyQuickFilter('criticalOnly')}
            className="text-sm py-2 px-3 bg-orange-100 hover:bg-orange-200 rounded"
          >
            ⚠️ Level 1-3
          </button>
          <button 
            onClick={() => applyQuickFilter('todaysPriorities')}
            className="text-sm py-2 px-3 bg-purple-100 hover:bg-purple-200 rounded"
          >
            📋 Today's Priorities
          </button>
          <button 
            onClick={() => applyQuickFilter('safeCameras')}
            className="text-sm py-2 px-3 bg-green-100 hover:bg-green-200 rounded"
          >
            ✅ Safe (L4-5)
          </button>
        </div>
      </div>
      
      {/* Water & Status Quick Filters */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">💧 Water & Status:</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => applyQuickFilter('highWater')}
            className="text-sm py-2 px-3 bg-blue-100 hover:bg-blue-200 rounded"
          >
            💧 High Water
          </button>
          <button 
            onClick={() => applyQuickFilter('abnormalWater')}
            className="text-sm py-2 px-3 bg-cyan-100 hover:bg-cyan-200 rounded"
          >
            🌊 Abnormal Water
          </button>
          <button 
            onClick={() => applyQuickFilter('warningStatus')}
            className="text-sm py-2 px-3 bg-yellow-100 hover:bg-yellow-200 rounded"
          >
            ⚠️ WARNING Status
          </button>
          <button 
            onClick={() => applyQuickFilter('unreliableCameras')}
            className="text-sm py-2 px-3 bg-amber-100 hover:bg-amber-200 rounded"
          >
            📉 Unreliable
          </button>
        </div>
      </div>
      
      {/* Description Keyword Filters */}
      <div className="mb-4">
        <button 
          onClick={() => setShowKeywordFilters(!showKeywordFilters)}
          className="w-full text-left text-sm font-semibold mb-2 flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
        >
          <span>🏷️ Description Keywords:</span>
          <span>{showKeywordFilters ? '▼' : '▶'}</span>
        </button>
        
        {showKeywordFilters && (
          <div className="space-y-2 pl-2 border-l-2 border-gray-200">
            {/* Keyword Category Toggles */}
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.hasUrgencyKeywords || false}
                onChange={(e) => handleFilterChange('hasUrgencyKeywords', e.target.checked)}
              />
              <span>🚨 Urgency (urgent, emergency, critical)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.hasObstructionKeywords || false}
                onChange={(e) => handleFilterChange('hasObstructionKeywords', e.target.checked)}
              />
              <span>🚫 Obstruction (blockage, clog, debris)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.hasStructuralKeywords || false}
                onChange={(e) => handleFilterChange('hasStructuralKeywords', e.target.checked)}
              />
              <span>🏗️ Structural (crack, collapse, damage)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.hasBuildupKeywords || false}
                onChange={(e) => handleFilterChange('hasBuildupKeywords', e.target.checked)}
              />
              <span>🧱 Buildup (grease, sediment, scale)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.hasFlowKeywords || false}
                onChange={(e) => handleFilterChange('hasFlowKeywords', e.target.checked)}
              />
              <span>🌊 Flow Issues (slow drain, standing)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.hasBioKeywords || false}
                onChange={(e) => handleFilterChange('hasBioKeywords', e.target.checked)}
              />
              <span>🦠 Bio/Odor (biofilm, odor, slime)</span>
            </label>
            
            {/* Custom Keywords */}
            <div className="pt-2 border-t">
              <label className="block text-xs font-semibold mb-1">Custom Keywords:</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomKeyword()}
                  placeholder="Add keyword..."
                  className="flex-1 p-1 text-sm border rounded"
                />
                <button 
                  onClick={addCustomKeyword}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  +
                </button>
              </div>
              
              {filters.descriptionKeywords && filters.descriptionKeywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.descriptionKeywords.map(keyword => (
                    <span 
                      key={keyword}
                      className="text-xs px-2 py-1 bg-blue-100 rounded flex items-center gap-1"
                    >
                      {keyword}
                      <button 
                        onClick={() => removeCustomKeyword(keyword)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Camera ID Search */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">🔎 Search Camera ID:</label>
        <input 
          type="text"
          value={filters.searchId || ''}
          onChange={(e) => handleFilterChange('searchId', e.target.value)}
          placeholder="Enter camera ID..."
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Advanced Filters Toggle */}
      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full mb-4 text-sm font-semibold p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-between"
      >
        <span>⚙️ Advanced Filters</span>
        <span>{showAdvanced ? '▼' : '▶'}</span>
      </button>
      
      {showAdvanced && (
        <div className="space-y-4 mb-4 pl-2 border-l-2 border-gray-300">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">Camera Status:</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="OK">OK</option>
              <option value="LOWLIGHT">LOWLIGHT</option>
              <option value="WARNING">WARNING</option>
            </select>
          </div>
          
          {/* Water Level Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Water Level: {filters.waterMin ? `${(filters.waterMin * 100).toFixed(0)}%` : '0%'} - 
              {filters.waterMax ? ` ${(filters.waterMax * 100).toFixed(0)}%` : ' 100%'}
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-600">Min:</label>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.waterMin || 0}
                  onChange={(e) => handleFilterChange('waterMin', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600">Max:</label>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.waterMax || 1}
                  onChange={(e) => handleFilterChange('waterMax', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Light Intensity Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Light Intensity:
              <span className="text-xs text-gray-500 ml-2">(higher = darker pipe)</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="number"
                step="0.1"
                placeholder="Min"
                value={filters.lightMin || ''}
                onChange={(e) => handleFilterChange('lightMin', parseFloat(e.target.value))}
                className="flex-1 p-2 border rounded text-sm"
              />
              <input 
                type="number"
                step="0.1"
                placeholder="Max"
                value={filters.lightMax || ''}
                onChange={(e) => handleFilterChange('lightMax', parseFloat(e.target.value))}
                className="flex-1 p-2 border rounded text-sm"
              />
            </div>
          </div>
          
          {/* Severity Level Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Severity Level:
              <span className="text-xs text-gray-500 ml-2">(5=best, 1=worst)</span>
            </label>
            <select 
              value={filters.maxSeverity || ''}
              onChange={(e) => handleFilterChange('maxSeverity', parseInt(e.target.value) || undefined)}
              className="w-full p-2 border rounded mb-2 text-sm"
            >
              <option value="">Show worse than...</option>
              <option value="1">Level 1 Only (Critical)</option>
              <option value="2">Levels 1-2 (Severe+)</option>
              <option value="3">Levels 1-3 (Moderate+)</option>
            </select>
            
            <select 
              value={filters.minSeverity || ''}
              onChange={(e) => handleFilterChange('minSeverity', parseInt(e.target.value) || undefined)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">Show better than...</option>
              <option value="4">Levels 4-5 (Minor/Safe)</option>
              <option value="5">Level 5 Only (Safe)</option>
            </select>
          </div>
          
          {/* Special Filter Toggles */}
          <div className="space-y-2">
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.abnormalWater || false}
                onChange={(e) => handleFilterChange('abnormalWater', e.target.checked)}
              />
              <span>🌊 Abnormally High Water (&gt;70%)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.multiFactor || false}
                onChange={(e) => handleFilterChange('multiFactor', e.target.checked)}
              />
              <span>🔀 Multi-Factor Critical (Level 3+ + WARNING/High Water)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.unreliableSensors || false}
                onChange={(e) => handleFilterChange('unreliableSensors', e.target.checked)}
              />
              <span>📉 Unreliable Sensors (LOWLIGHT/WARNING)</span>
            </label>
            
            <label className="flex items-center text-sm space-x-2">
              <input 
                type="checkbox"
                checked={filters.highRisk || false}
                onChange={(e) => handleFilterChange('highRisk', e.target.checked)}
              />
              <span>⚡ High Risk Score (&gt;70)</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Clear Button */}
      <button 
        onClick={clearFilters}
        className="w-full bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded"
      >
        🔄 Clear All Filters
      </button>
      
      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
        <strong>📘 Inverted Scale Guide:</strong>
        <div className="mt-1 space-y-1">
          <div>🔴 Level 1 = Critical (worst)</div>
          <div>🚨 Level 2 = Severe</div>
          <div>⚠️ Level 3 = Moderate</div>
          <div>⚡ Level 4 = Minor</div>
          <div>✅ Level 5 = Safe (best)</div>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {Object.values(filters).some(v => v !== undefined && v !== 'ALL' && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0)) && (
        <div className="mt-4 p-3 bg-yellow-50 rounded text-xs">
          <strong>🔍 Active Filters:</strong>
          <div className="mt-2 text-gray-700">
            Filtering {filterCameras(cameras, filters).length} of {cameras.length} cameras
          </div>
        </div>
      )}
    </div>
  );
}