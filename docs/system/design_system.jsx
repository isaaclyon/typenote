import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass,
  CalendarBlank,
  FileText,
  CheckSquare,
  User,
  Folder,
  BookOpen,
  Archive,
  Gear,
  Plus,
  CaretLeft,
  CaretRight,
  Check,
  Link,
  DotsThree,
  CaretDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeSlash,
  Funnel,
  ArrowRight,
  X,
} from '@phosphor-icons/react';

const colors = {
  foundation: [
    { name: 'white', hex: '#ffffff', desc: 'content background, cards' },
    { name: 'gray-50', hex: '#fafaf9', desc: 'subtle warm off-white' },
    { name: 'gray-100', hex: '#f5f5f4', desc: 'sidebar, secondary surfaces' },
    { name: 'gray-200', hex: '#e7e5e4', desc: 'borders, dividers' },
    { name: 'gray-300', hex: '#d6d3d1', desc: 'stronger borders, hover' },
    { name: 'gray-400', hex: '#a8a29e', desc: 'placeholder text' },
    { name: 'gray-500', hex: '#78716c', desc: 'muted/secondary text' },
    { name: 'gray-600', hex: '#57534e', desc: 'body text' },
    { name: 'gray-700', hex: '#44403c', desc: 'primary text' },
    { name: 'gray-800', hex: '#292524', desc: 'headlines' },
    { name: 'gray-900', hex: '#1c1917', desc: 'near-black emphasis' },
  ],
  cornflower: [
    { name: 'accent-50', hex: '#f0f4ff', desc: 'hover backgrounds' },
    { name: 'accent-100', hex: '#dbe4ff', desc: 'selection, highlights' },
    { name: 'accent-200', hex: '#bac8ff', desc: 'light accent uses' },
    { name: 'accent-300', hex: '#91a7ff', desc: 'secondary accent' },
    { name: 'accent-400', hex: '#748ffc', desc: 'hover states' },
    { name: 'accent-500', hex: '#6495ED', desc: 'PRIMARY — Cornflower Blue' },
    { name: 'accent-600', hex: '#5076d4', desc: 'pressed states' },
    { name: 'accent-700', hex: '#3d5fc2', desc: 'dark accent' },
  ],
  semantic: [
    { name: 'error', hex: '#e57373', desc: 'soft coral-red' },
    { name: 'success', hex: '#81c784', desc: 'soft sage-green' },
    { name: 'warning', hex: '#ffb74d', desc: 'soft amber' },
    { name: 'info', hex: '#6495ED', desc: 'cornflower (same as accent)' },
  ],
};

// Typography System
const typography = {
  fonts: {
    sans: "'IBM Plex Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace",
  },
  sizes: [
    { name: 'text-xs', size: '12px', desc: 'fine print, timestamps' },
    { name: 'text-sm', size: '13px', desc: 'labels, metadata' },
    { name: 'text-base', size: '15px', desc: 'body text, editor content' },
    { name: 'text-lg', size: '17px', desc: 'subheadings' },
    { name: 'text-xl', size: '20px', desc: 'section titles' },
    { name: 'text-2xl', size: '24px', desc: 'page titles' },
    { name: 'text-3xl', size: '30px', desc: 'hero headings (rare)' },
  ],
  weights: [
    { name: 'font-normal', value: 400, desc: 'body text' },
    { name: 'font-medium', value: 500, desc: 'labels, emphasis' },
    { name: 'font-semibold', value: 600, desc: 'headings, buttons' },
  ],
  lineHeights: [
    { name: 'leading-tight', value: 1.25, desc: 'headings' },
    { name: 'leading-normal', value: 1.5, desc: 'body text' },
    { name: 'leading-relaxed', value: 1.625, desc: 'long-form reading' },
  ],
  letterSpacing: [
    { name: 'tracking-tight', value: '-0.02em', desc: 'headlines' },
    { name: 'tracking-normal', value: '0', desc: 'body' },
    { name: 'tracking-wide', value: '0.025em', desc: 'uppercase labels' },
  ],
};

// Spacing & Layout System
const spacing = {
  scale: [
    { name: 'space-1', value: '4px', desc: 'micro: icon gaps, tight margins' },
    { name: 'space-2', value: '8px', desc: 'small: within components' },
    { name: 'space-3', value: '12px', desc: 'medium: between related elements' },
    { name: 'space-4', value: '16px', desc: 'standard: section padding' },
    { name: 'space-5', value: '20px', desc: 'comfortable gaps' },
    { name: 'space-6', value: '24px', desc: 'between sections' },
    { name: 'space-8', value: '32px', desc: 'major separation' },
    { name: 'space-10', value: '40px', desc: 'large gaps' },
    { name: 'space-12', value: '48px', desc: 'page-level spacing' },
  ],
  layout: {
    sidebar: { min: 240, max: 260, desc: 'collapsible, same bg as content' },
    content: { padding: { sm: 24, md: 48, lg: 80 }, desc: 'fluid width, responsive padding' },
    rightPanel: { width: 280, desc: 'contextual: backlinks, page info' },
  },
  interactive: {
    buttonHeight: { min: 36, max: 40 },
    touchTarget: 36,
  },
};

// Components & Interactions
const components = {
  borders: {
    weight: '1px',
    default: { color: '#e7e5e4', token: '--gray-200' },
    strong: { color: '#d6d3d1', token: '--gray-300' },
    radius: { default: '4px', large: '6px' },
  },
  shadows: [
    { name: 'shadow-sm', value: '0 1px 2px rgba(0, 0, 0, 0.04)', desc: 'subtle elevation' },
    { name: 'shadow-md', value: '0 2px 4px rgba(0, 0, 0, 0.06)', desc: 'cards, dropdowns' },
  ],
  states: {
    hover: { bg: '#fafaf9', border: '#d6d3d1' },
    focus: '0 0 0 2px white, 0 0 0 4px #6495ED',
    selection: 'rgba(100, 149, 237, 0.25)',
  },
  animation: {
    micro: '150ms',
    standard: '200ms',
    easing: 'ease-out',
  },
};

// States & Feedback
const states = {
  status: [
    { name: 'Error', color: '#e57373', use: 'Destructive actions, validation failures' },
    { name: 'Success', color: '#81c784', use: 'Saved, completed, positive' },
    { name: 'Warning', color: '#ffb74d', use: 'Caution, unsaved changes' },
    { name: 'Info', color: '#6495ED', use: 'Neutral information (cornflower)' },
  ],
  save: [
    { label: 'Saving...', style: 'muted, subtle' },
    { label: 'Saved', style: 'briefly shown, then fades' },
  ],
};

// Daily Notes Context
const dailyNotes = {
  navigation: ['← Prior Day', 'Today / Wed, Jan 8', 'Next →'],
  miniCalendar: {
    month: 'January 2026',
    daysWithNotes: [3, 5, 6, 7, 8, 12, 15, 18, 20, 22],
  },
  rightPanelRegular: ['Backlinks', 'Page info', 'Tags', 'Settings'],
};

function SidebarTypeItem({ type }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '4px 8px',
        backgroundColor: isHovered ? '#fafaf9' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '13px',
        color: '#44403c',
        textAlign: 'left',
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        style={{
          color: type.color,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {React.cloneElement(type.icon, { size: 14 })}
      </span>
      <span style={{ flex: 1, fontWeight: 500 }}>{type.name}</span>
      <span
        style={{
          fontSize: '11px',
          color: '#a8a29e',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.1s',
          fontFamily: typography.fonts.mono,
        }}
      >
        {type.count}
      </span>
    </button>
  );
}

// Sample data for Type Browser
const sampleNotes = [
  {
    id: 1,
    title: 'Q1 Planning Session',
    modified: '2 hours ago',
    tags: ['work', 'planning'],
    status: 'Active',
  },
  {
    id: 2,
    title: 'Meeting Notes - Product Sync',
    modified: '5 hours ago',
    tags: ['work', 'meetings'],
    status: 'Done',
  },
  {
    id: 3,
    title: 'Book: Thinking in Systems',
    modified: 'Yesterday',
    tags: ['reading', 'learning'],
    status: 'Active',
  },
  {
    id: 4,
    title: 'Recipe: Sourdough Bread',
    modified: 'Jan 6',
    tags: ['personal', 'cooking'],
    status: 'Done',
  },
  {
    id: 5,
    title: 'Project Ideas for 2026',
    modified: 'Jan 5',
    tags: ['personal', 'ideas'],
    status: 'Draft',
  },
  {
    id: 6,
    title: 'Weekly Review Template',
    modified: 'Jan 3',
    tags: ['work', 'templates'],
    status: 'Active',
  },
  {
    id: 7,
    title: 'Travel Plans - Summer',
    modified: 'Dec 28',
    tags: ['personal', 'travel'],
    status: 'Draft',
  },
];

// Column Header Component with dropdown
function ColumnHeader({ label, width, sortable = true, onSort, sortDir, canHide = true }) {
  const [showMenu, setShowMenu] = useState(false);

  const isFlexWidth = width === 'flex';

  return (
    <div
      style={{
        position: 'relative',
        ...(isFlexWidth ? { flex: 1, minWidth: '200px' } : { width, minWidth: width }),
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: 500,
        color: '#78716c',
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        borderBottom: '1px solid #e7e5e4',
        cursor: sortable ? 'pointer' : 'default',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      onClick={() => sortable && setShowMenu(!showMenu)}
    >
      <span>{label}</span>
      {sortDir && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      {sortable && <CaretDown size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 20,
              minWidth: '140px',
              padding: '4px',
            }}
          >
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#44403c',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafaf9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ArrowUp size={14} />
              Sort ascending
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#44403c',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafaf9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ArrowDown size={14} />
              Sort descending
            </button>
            <div style={{ height: '1px', backgroundColor: '#e7e5e4', margin: '4px 0' }} />
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#44403c',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafaf9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Funnel size={14} />
              Filter...
            </button>
            {canHide && (
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#44403c',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafaf9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <EyeSlash size={14} />
                Hide column
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Table Row Component
function TableRow({ note, isSelected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    Active: { bg: '#6495ED20', text: '#3d5fc2' },
    Done: { bg: '#81c78420', text: '#4caf50' },
    Draft: { bg: '#ffb74d20', text: '#b8860b' },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #f5f5f4',
        backgroundColor: isHovered ? '#fafaf9' : '#ffffff',
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <div
        style={{
          width: '40px',
          minWidth: '40px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          style={{
            width: '14px',
            height: '14px',
            cursor: 'pointer',
            accentColor: '#6495ED',
          }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          flex: 1,
          minWidth: '200px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            color: '#292524',
            fontWeight: 500,
            flex: 1,
          }}
        >
          {note.title}
        </span>
        {isHovered && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: '#6495ED',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#ffffff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Open
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Modified */}
      <div
        style={{
          width: '100px',
          minWidth: '100px',
          padding: '10px 12px',
          fontSize: '13px',
          color: '#78716c',
        }}
      >
        {note.modified}
      </div>

      {/* Tags */}
      <div
        style={{
          width: '150px',
          minWidth: '150px',
          padding: '10px 12px',
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
        }}
      >
        {note.tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '2px 6px',
              backgroundColor: '#f5f5f4',
              borderRadius: '3px',
              fontSize: '11px',
              color: '#57534e',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Status */}
      <div
        style={{
          width: '90px',
          minWidth: '90px',
          padding: '10px 12px',
        }}
      >
        <span
          style={{
            padding: '3px 8px',
            backgroundColor: statusColors[note.status]?.bg || '#f5f5f4',
            color: statusColors[note.status]?.text || '#57534e',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {note.status}
        </span>
      </div>

      {/* Actions */}
      <div
        style={{
          width: '50px',
          minWidth: '50px',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {isHovered && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#78716c',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e7e5e4')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <DotsThree size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// Type Browser Component
function TypeBrowser() {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const toggleRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === sampleNotes.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sampleNotes.map((n) => n.id)));
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e7e5e4',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #e7e5e4',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1,
          }}
        >
          <span style={{ color: '#6495ED' }}>
            <FileText size={20} />
          </span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#292524',
              letterSpacing: '-0.02em',
            }}
          >
            Notes
          </span>
          <span
            style={{
              fontSize: '13px',
              color: '#a8a29e',
              fontFamily: typography.fonts.mono,
            }}
          >
            {sampleNotes.length}
          </span>
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            backgroundColor: '#fafaf9',
            border: '1px solid #e7e5e4',
            borderRadius: '6px',
            width: '200px',
          }}
        >
          <MagnifyingGlass size={14} color="#a8a29e" />
          <input
            type="text"
            placeholder="Search notes..."
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#44403c',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* New Note Button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#6495ED',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#ffffff',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Plus size={14} />
          New Note
        </button>

        {/* Column Settings */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: showColumnSettings ? '#f5f5f4' : 'transparent',
              border: '1px solid #e7e5e4',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#78716c',
            }}
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            <Gear size={16} />
          </button>

          {/* Column Settings Dropdown */}
          {showColumnSettings && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                onClick={() => setShowColumnSettings(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e7e5e4',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  zIndex: 20,
                  minWidth: '180px',
                  padding: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#a8a29e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '4px 8px',
                    marginBottom: '4px',
                  }}
                >
                  Visible Columns
                </div>
                {['Title', 'Modified', 'Tags', 'Status'].map((col) => (
                  <label
                    key={col}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      cursor: col === 'Title' ? 'not-allowed' : 'pointer',
                      opacity: col === 'Title' ? 0.5 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={col === 'Title'}
                      style={{ accentColor: '#6495ED' }}
                      readOnly
                    />
                    <span style={{ fontSize: '13px', color: '#44403c' }}>{col}</span>
                    {col === 'Title' && (
                      <span style={{ fontSize: '10px', color: '#a8a29e', marginLeft: 'auto' }}>
                        Required
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        {/* Column Headers */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#fafaf9',
            position: 'sticky',
            top: 0,
          }}
        >
          {/* Checkbox Header */}
          <div
            style={{
              width: '40px',
              minWidth: '40px',
              padding: '8px 12px',
              borderBottom: '1px solid #e7e5e4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              type="checkbox"
              checked={selectedRows.size === sampleNotes.length}
              onChange={toggleAll}
              style={{
                width: '14px',
                height: '14px',
                cursor: 'pointer',
                accentColor: '#6495ED',
              }}
            />
          </div>

          <ColumnHeader label="Title" width="flex" sortable={true} sortDir="desc" canHide={false} />
          <ColumnHeader label="Modified" width="100px" sortable={true} />
          <ColumnHeader label="Tags" width="150px" sortable={false} />
          <ColumnHeader label="Status" width="90px" sortable={true} />

          {/* Actions Header */}
          <div
            style={{
              width: '50px',
              minWidth: '50px',
              padding: '8px 12px',
              borderBottom: '1px solid #e7e5e4',
            }}
          />
        </div>

        {/* Rows */}
        {sampleNotes.map((note) => (
          <TableRow
            key={note.id}
            note={note}
            isSelected={selectedRows.has(note.id)}
            onSelect={() => toggleRow(note.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: '1px solid #e7e5e4',
          backgroundColor: '#fafaf9',
        }}
      >
        <span style={{ fontSize: '12px', color: '#78716c' }}>
          {selectedRows.size > 0
            ? `${selectedRows.size} of ${sampleNotes.length} selected`
            : `${sampleNotes.length} notes`}
        </span>
        {selectedRows.size > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #e7e5e4',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#78716c',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Archive
            </button>
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #e57373',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#e57373',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorSwatch({ color, isDark }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={copyToClipboard}
      style={{
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e7e5e4',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          backgroundColor: color.hex,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: color.hex === '#ffffff' ? '1px solid #e7e5e4' : 'none',
          borderRadius: color.hex === '#ffffff' ? '7px 7px 0 0' : '0',
          margin: color.hex === '#ffffff' ? '-1px -1px 0 -1px' : '0',
        }}
      >
        {copied && (
          <span
            style={{
              color: isDark ? '#fafaf9' : '#44403c',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            Copied!
          </span>
        )}
      </div>
      <div style={{ padding: '10px 12px', backgroundColor: '#fff' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#44403c',
            marginBottom: '2px',
          }}
        >
          {color.name}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#78716c',
            fontFamily: typography.fonts.mono,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {color.hex}
        </div>
        {color.desc && (
          <div
            style={{
              fontSize: '12px',
              color: '#a8a29e',
              marginTop: '4px',
            }}
          >
            {color.desc}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorSection({ title, colors, startDarkAt = 5 }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#57534e',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '16px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {colors.map((color, i) => (
          <ColorSwatch key={color.name} color={color} isDark={i >= startDarkAt} />
        ))}
      </div>
    </div>
  );
}

export default function TypeNotePalette() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div
      style={{
        fontFamily: typography.fonts.sans,
        backgroundColor: '#fafaf9',
        minHeight: '100vh',
        padding: '32px',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: 600,
              color: '#292524',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            TypeNote
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#78716c',
              lineHeight: 1.5,
            }}
          >
            Design System — Colors & Typography
          </p>
        </div>

        {/* Color Swatches */}
        <ColorSection title="Gray Foundation" colors={colors.foundation} startDarkAt={6} />

        <ColorSection title="Cornflower Blue Accent" colors={colors.cornflower} startDarkAt={5} />

        <ColorSection title="Semantic Colors" colors={colors.semantic} startDarkAt={10} />

        {/* Typography Section */}
        <div style={{ marginTop: '56px', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '24px',
            }}
          >
            Typography
          </h2>

          {/* Font Families */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Font Families
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 400,
                    color: '#292524',
                    fontFamily: typography.fonts.sans,
                  }}
                >
                  IBM Plex Sans
                </span>
                <code
                  style={{
                    fontSize: '12px',
                    color: '#78716c',
                    fontFamily: typography.fonts.mono,
                    backgroundColor: '#f5f5f4',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  --font-sans
                </code>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 400,
                    color: '#292524',
                    fontFamily: typography.fonts.mono,
                  }}
                >
                  IBM Plex Mono
                </span>
                <code
                  style={{
                    fontSize: '12px',
                    color: '#78716c',
                    fontFamily: typography.fonts.mono,
                    backgroundColor: '#f5f5f4',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  --font-mono
                </code>
              </div>
            </div>
          </div>

          {/* Type Scale */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '20px',
              }}
            >
              Type Scale
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {typography.sizes.map((size) => (
                <div
                  key={size.name}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '16px',
                    borderBottom: '1px solid #f5f5f4',
                    paddingBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: size.size,
                      fontWeight:
                        size.name.includes('2xl') || size.name.includes('3xl') ? 600 : 400,
                      color: '#292524',
                      minWidth: '200px',
                      letterSpacing: size.name.includes('xl') ? '-0.02em' : '0',
                      lineHeight: size.name.includes('xl') ? 1.25 : 1.5,
                    }}
                  >
                    The quick brown fox
                  </span>
                  <code
                    style={{
                      fontSize: '12px',
                      color: '#6495ED',
                      fontFamily: typography.fonts.mono,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {size.size}
                  </code>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#a8a29e',
                    }}
                  >
                    {size.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weights, Line Heights, Letter Spacing */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Weights */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '14px',
                }}
              >
                Weights
              </p>
              {typography.weights.map((w) => (
                <div key={w.name} style={{ marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: w.value,
                      color: '#44403c',
                      display: 'block',
                    }}
                  >
                    {w.value} — {w.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* Line Heights */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '14px',
                }}
              >
                Line Heights
              </p>
              {typography.lineHeights.map((lh) => (
                <div
                  key={lh.name}
                  style={{
                    marginBottom: '10px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'baseline',
                  }}
                >
                  <code
                    style={{
                      fontSize: '13px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {lh.value}
                  </code>
                  <span style={{ fontSize: '13px', color: '#78716c' }}>{lh.desc}</span>
                </div>
              ))}
            </div>

            {/* Letter Spacing */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '14px',
                }}
              >
                Letter Spacing
              </p>
              {typography.letterSpacing.map((ls) => (
                <div
                  key={ls.name}
                  style={{
                    marginBottom: '10px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'baseline',
                  }}
                >
                  <code
                    style={{
                      fontSize: '13px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                    }}
                  >
                    {ls.value || '0'}
                  </code>
                  <span style={{ fontSize: '13px', color: '#78716c' }}>{ls.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spacing & Layout Section */}
        <div style={{ marginTop: '56px', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '24px',
            }}
          >
            Spacing & Layout
          </h2>

          {/* Spacing Scale Visual */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '20px',
              }}
            >
              4px Base Grid
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {spacing.scale.map((space) => (
                <div
                  key={space.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: parseInt(space.value),
                      height: '24px',
                      backgroundColor: '#6495ED',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  />
                  <code
                    style={{
                      fontSize: '13px',
                      fontFamily: typography.fonts.mono,
                      color: '#44403c',
                      minWidth: '70px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {space.value}
                  </code>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#78716c',
                      minWidth: '80px',
                    }}
                  >
                    {space.name}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#a8a29e',
                    }}
                  >
                    {space.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Structure Diagram */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '20px',
              }}
            >
              Layout Structure
            </p>

            {/* Visual Layout Diagram */}
            <div
              style={{
                display: 'flex',
                border: '2px solid #e7e5e4',
                borderRadius: '8px',
                overflow: 'hidden',
                height: '200px',
                marginBottom: '20px',
              }}
            >
              {/* Left Sidebar */}
              <div
                style={{
                  width: '140px',
                  backgroundColor: '#ffffff',
                  borderRight: '1px solid #e7e5e4',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#292524',
                    marginBottom: '4px',
                  }}
                >
                  Sidebar
                </div>
                <div style={{ fontSize: '10px', color: '#78716c' }}>240–260px</div>
                <div style={{ height: '1px', backgroundColor: '#e7e5e4', margin: '4px 0' }} />
                <div style={{ fontSize: '10px', color: '#a8a29e' }}>• Types + Quick Access</div>
                <div style={{ fontSize: '10px', color: '#a8a29e' }}>• Calendar</div>
                <div style={{ fontSize: '10px', color: '#a8a29e' }}>• Tasks</div>
              </div>

              {/* Content Area */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#fafaf9',
                  padding: '12px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#292524',
                    marginBottom: '4px',
                  }}
                >
                  Content Area
                </div>
                <div style={{ fontSize: '10px', color: '#78716c', marginBottom: '8px' }}>
                  Fluid width
                </div>
                <div
                  style={{
                    flex: 1,
                    border: '1px dashed #d6d3d1',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#a8a29e' }}>Responsive padding:</div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6495ED',
                      fontFamily: typography.fonts.mono,
                    }}
                  >
                    24px → 48px → 80px
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div
                style={{
                  width: '120px',
                  backgroundColor: '#ffffff',
                  borderLeft: '1px solid #e7e5e4',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#292524',
                    marginBottom: '4px',
                  }}
                >
                  Right Panel
                </div>
                <div style={{ fontSize: '10px', color: '#78716c' }}>Contextual</div>
                <div style={{ height: '1px', backgroundColor: '#e7e5e4', margin: '4px 0' }} />
                <div style={{ fontSize: '10px', color: '#a8a29e' }}>• Backlinks</div>
                <div style={{ fontSize: '10px', color: '#a8a29e' }}>• Page info</div>
                <div style={{ fontSize: '10px', color: '#a8a29e' }}>• Settings</div>
              </div>
            </div>

            {/* Layout Specs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f5f5f4',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#44403c',
                    marginBottom: '4px',
                  }}
                >
                  Sidebar
                </div>
                <code
                  style={{
                    fontSize: '12px',
                    fontFamily: typography.fonts.mono,
                    color: '#6495ED',
                  }}
                >
                  240–260px
                </code>
                <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '4px' }}>
                  Collapsible
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#f5f5f4',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#44403c',
                    marginBottom: '4px',
                  }}
                >
                  Content Padding
                </div>
                <code
                  style={{
                    fontSize: '12px',
                    fontFamily: typography.fonts.mono,
                    color: '#6495ED',
                  }}
                >
                  24 / 48 / 80px
                </code>
                <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '4px' }}>
                  Responsive
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#f5f5f4',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#44403c',
                    marginBottom: '4px',
                  }}
                >
                  Right Panel
                </div>
                <code
                  style={{
                    fontSize: '12px',
                    fontFamily: typography.fonts.mono,
                    color: '#6495ED',
                  }}
                >
                  ~280px
                </code>
                <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '4px' }}>
                  Contextual
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Elements */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '20px',
              }}
            >
              Interactive Elements
            </p>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {/* Button Height Demo */}
              <div>
                <div style={{ fontSize: '11px', color: '#78716c', marginBottom: '8px' }}>
                  Button/Input Height
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      backgroundColor: '#6495ED',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    36px
                  </button>
                  <button
                    style={{
                      height: '40px',
                      padding: '0 16px',
                      backgroundColor: '#6495ED',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '15px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    40px
                  </button>
                </div>
              </div>

              {/* Touch Target Demo */}
              <div>
                <div style={{ fontSize: '11px', color: '#78716c', marginBottom: '8px' }}>
                  Minimum Touch Target
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#f0f4ff',
                      border: '2px dashed #6495ED',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#6495ED',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <code
                    style={{
                      fontSize: '12px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                    }}
                  >
                    36×36px min
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Components & Interactions Section */}
        <div style={{ marginTop: '56px', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '24px',
            }}
          >
            Components & Interactions
          </h2>

          {/* Borders & Radius */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Border Styles */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '16px',
                }}
              >
                Borders
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '32px',
                      border: '1px solid #e7e5e4',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', color: '#44403c' }}>Default</div>
                    <code
                      style={{
                        fontSize: '11px',
                        fontFamily: typography.fonts.mono,
                        color: '#6495ED',
                      }}
                    >
                      1px solid --gray-200
                    </code>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '32px',
                      border: '1px solid #d6d3d1',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', color: '#44403c' }}>Strong / Hover</div>
                    <code
                      style={{
                        fontSize: '11px',
                        fontFamily: typography.fonts.mono,
                        color: '#6495ED',
                      }}
                    >
                      1px solid --gray-300
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '16px',
                }}
              >
                Border Radius
              </p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      border: '1px solid #e7e5e4',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f4',
                      marginBottom: '8px',
                    }}
                  />
                  <code
                    style={{
                      fontSize: '11px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                    }}
                  >
                    4px
                  </code>
                  <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px' }}>
                    default
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '48px',
                      border: '1px solid #e7e5e4',
                      borderRadius: '6px',
                      backgroundColor: '#f5f5f4',
                      marginBottom: '8px',
                    }}
                  />
                  <code
                    style={{
                      fontSize: '11px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                    }}
                  >
                    6px
                  </code>
                  <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px' }}>large</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shadows */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Depth Strategy — Borders Primary, Minimal Shadows
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {components.shadows.map((shadow) => (
                <div key={shadow.name} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '56px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e7e5e4',
                      borderRadius: '6px',
                      boxShadow: shadow.value,
                      marginBottom: '8px',
                    }}
                  />
                  <code
                    style={{
                      fontSize: '11px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                      display: 'block',
                    }}
                  >
                    {shadow.name}
                  </code>
                  <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px' }}>
                    {shadow.desc}
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '80px',
                    height: '56px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e7e5e4',
                    borderRadius: '6px',
                    marginBottom: '8px',
                  }}
                />
                <code
                  style={{
                    fontSize: '11px',
                    fontFamily: typography.fonts.mono,
                    color: '#78716c',
                    display: 'block',
                  }}
                >
                  no shadow
                </code>
                <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px' }}>
                  border only
                </div>
              </div>
            </div>
          </div>

          {/* Interactive States */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Hover State */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '12px',
                }}
              >
                Hover State
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e7e5e4',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#44403c',
                  }}
                >
                  Default
                </div>
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fafaf9',
                    border: '1px solid #d6d3d1',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#44403c',
                  }}
                >
                  Hovered
                </div>
              </div>
            </div>

            {/* Focus Ring */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '12px',
                }}
              >
                Focus Ring (Apple-style)
              </p>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6495ED',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  boxShadow: '0 0 0 2px white, 0 0 0 4px #6495ED',
                }}
              >
                Focused
              </button>
            </div>

            {/* Selection */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '12px',
                }}
              >
                Text Selection
              </p>
              <p style={{ fontSize: '13px', color: '#57534e', lineHeight: 1.5 }}>
                Try selecting{' '}
                <span
                  style={{
                    backgroundColor: 'rgba(100, 149, 237, 0.25)',
                    padding: '1px 2px',
                    borderRadius: '2px',
                  }}
                >
                  this text
                </span>{' '}
                to see the cornflower tint.
              </p>
            </div>
          </div>

          {/* Animation & Scrollbar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Animation Timing */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '16px',
                }}
              >
                Animation
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <code
                    style={{
                      fontSize: '13px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                      minWidth: '60px',
                    }}
                  >
                    150ms
                  </code>
                  <span style={{ fontSize: '13px', color: '#78716c' }}>micro interactions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <code
                    style={{
                      fontSize: '13px',
                      fontFamily: typography.fonts.mono,
                      color: '#6495ED',
                      minWidth: '60px',
                    }}
                  >
                    200ms
                  </code>
                  <span style={{ fontSize: '13px', color: '#78716c' }}>standard transitions</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}
                >
                  <code
                    style={{
                      fontSize: '13px',
                      fontFamily: typography.fonts.mono,
                      color: '#44403c',
                      minWidth: '60px',
                    }}
                  >
                    ease-out
                  </code>
                  <span style={{ fontSize: '13px', color: '#78716c' }}>easing (no bounce)</span>
                </div>
              </div>
            </div>

            {/* Scrollbar */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '16px',
                }}
              >
                Scrollbar
              </p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '120px',
                    height: '80px',
                    backgroundColor: '#fafaf9',
                    border: '1px solid #e7e5e4',
                    borderRadius: '6px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Fake scrollbar */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '2px',
                      top: '8px',
                      width: '6px',
                      height: '32px',
                      backgroundColor: '#d6d3d1',
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#78716c' }}>
                  <div>
                    Width:{' '}
                    <code style={{ fontFamily: typography.fonts.mono, color: '#6495ED' }}>8px</code>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    Thumb:{' '}
                    <code style={{ fontFamily: typography.fonts.mono, color: '#6495ED' }}>
                      --gray-300
                    </code>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    Radius:{' '}
                    <code style={{ fontFamily: typography.fonts.mono, color: '#6495ED' }}>4px</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modals & Toasts */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Overlays
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {/* Command Palette */}
              <div>
                <div style={{ fontSize: '11px', color: '#78716c', marginBottom: '8px' }}>
                  Command Palette (⌘K)
                </div>
                <div
                  style={{
                    width: '200px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e7e5e4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #e7e5e4',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ color: '#a8a29e' }}>⌘</span>
                    <span style={{ fontSize: '13px', color: '#a8a29e' }}>Search commands...</span>
                  </div>
                  <div style={{ padding: '4px' }}>
                    <div
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#f0f4ff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#44403c',
                      }}
                    >
                      New Note
                    </div>
                    <div
                      style={{
                        padding: '8px 10px',
                        fontSize: '13px',
                        color: '#44403c',
                      }}
                    >
                      Search Notes
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '6px' }}>
                  Top-center position
                </div>
              </div>

              {/* Toast */}
              <div>
                <div style={{ fontSize: '11px', color: '#78716c', marginBottom: '8px' }}>
                  Toast Notification
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#292524',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <Check size={16} color="#81c784" />
                  Note saved
                </div>
                <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '6px' }}>
                  Bottom-right, slide-in
                </div>
              </div>

              {/* Modal */}
              <div>
                <div style={{ fontSize: '11px', color: '#78716c', marginBottom: '8px' }}>
                  Modal Dialog
                </div>
                <div
                  style={{
                    width: '180px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e7e5e4',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#292524',
                      marginBottom: '8px',
                    }}
                  >
                    Delete note?
                  </div>
                  <div style={{ fontSize: '13px', color: '#78716c', marginBottom: '12px' }}>
                    This cannot be undone.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        border: '1px solid #e7e5e4',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#44403c',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#e57373',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#fff',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '6px' }}>
                  Centered + blur backdrop
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* States & Feedback Section */}
        <div style={{ marginTop: '56px', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '24px',
            }}
          >
            States & Feedback
          </h2>

          {/* Loading States */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Loading States — Skeleton Placeholders
            </p>

            <style>
              {`
                @keyframes shimmer {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}
            </style>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {/* Skeleton Card */}
              <div
                style={{
                  width: '200px',
                  padding: '16px',
                  border: '1px solid #e7e5e4',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    height: '16px',
                    width: '70%',
                    background: 'linear-gradient(90deg, #f5f5f4 25%, #fafaf9 50%, #f5f5f4 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: '4px',
                    marginBottom: '12px',
                  }}
                />
                <div
                  style={{
                    height: '12px',
                    width: '100%',
                    background: 'linear-gradient(90deg, #f5f5f4 25%, #fafaf9 50%, #f5f5f4 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                />
                <div
                  style={{
                    height: '12px',
                    width: '85%',
                    background: 'linear-gradient(90deg, #f5f5f4 25%, #fafaf9 50%, #f5f5f4 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: '4px',
                  }}
                />
              </div>

              {/* Skeleton Code */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <pre
                  style={{
                    fontSize: '11px',
                    fontFamily: typography.fonts.mono,
                    color: '#78716c',
                    backgroundColor: '#f5f5f4',
                    padding: '12px',
                    borderRadius: '6px',
                    margin: 0,
                    lineHeight: 1.6,
                    overflow: 'auto',
                  }}
                >
                  {`.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-50) 50%,
    var(--gray-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Empty States */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Empty States — Functional, Not Passive
            </p>

            <div
              style={{
                border: '1px dashed #d6d3d1',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                backgroundColor: '#fafaf9',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  opacity: 0.4,
                }}
              >
                <FileText size={40} color="#78716c" />
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#44403c',
                  marginBottom: '8px',
                }}
              >
                No notes yet
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#78716c',
                  marginBottom: '16px',
                }}
              >
                Create your first note to get started
              </div>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6495ED',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} />
                Create Note
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '16px',
                }}
              >
                Keyboard Shortcuts
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontSize: '13px', color: '#44403c' }}>Command palette</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <kbd
                      style={{
                        display: 'inline-flex',
                        padding: '2px 6px',
                        fontFamily: typography.fonts.mono,
                        fontSize: '12px',
                        backgroundColor: '#fafaf9',
                        border: '1px solid #e7e5e4',
                        borderRadius: '4px',
                        color: '#44403c',
                      }}
                    >
                      ⌘
                    </kbd>
                    <kbd
                      style={{
                        display: 'inline-flex',
                        padding: '2px 6px',
                        fontFamily: typography.fonts.mono,
                        fontSize: '12px',
                        backgroundColor: '#fafaf9',
                        border: '1px solid #e7e5e4',
                        borderRadius: '4px',
                        color: '#44403c',
                      }}
                    >
                      K
                    </kbd>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontSize: '13px', color: '#44403c' }}>New note</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <kbd
                      style={{
                        display: 'inline-flex',
                        padding: '2px 6px',
                        fontFamily: typography.fonts.mono,
                        fontSize: '12px',
                        backgroundColor: '#fafaf9',
                        border: '1px solid #e7e5e4',
                        borderRadius: '4px',
                        color: '#44403c',
                      }}
                    >
                      ⌘
                    </kbd>
                    <kbd
                      style={{
                        display: 'inline-flex',
                        padding: '2px 6px',
                        fontFamily: typography.fonts.mono,
                        fontSize: '12px',
                        backgroundColor: '#fafaf9',
                        border: '1px solid #e7e5e4',
                        borderRadius: '4px',
                        color: '#44403c',
                      }}
                    >
                      N
                    </kbd>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontSize: '13px', color: '#44403c' }}>Search</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <kbd
                      style={{
                        display: 'inline-flex',
                        padding: '2px 6px',
                        fontFamily: typography.fonts.mono,
                        fontSize: '12px',
                        backgroundColor: '#fafaf9',
                        border: '1px solid #e7e5e4',
                        borderRadius: '4px',
                        color: '#44403c',
                      }}
                    >
                      ⌘
                    </kbd>
                    <kbd
                      style={{
                        display: 'inline-flex',
                        padding: '2px 6px',
                        fontFamily: typography.fonts.mono,
                        fontSize: '12px',
                        backgroundColor: '#fafaf9',
                        border: '1px solid #e7e5e4',
                        borderRadius: '4px',
                        color: '#44403c',
                      }}
                    >
                      F
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Status */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '16px',
                }}
              >
                Save Status — Inline, Near Content
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#fafaf9',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#44403c' }}>Note title here</span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#a8a29e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#a8a29e',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite',
                      }}
                    />
                    Saving...
                  </span>
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#fafaf9',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#44403c' }}>Note title here</span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#81c784',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Check size={14} />
                    Saved
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#a8a29e', marginTop: '12px' }}>
                Auto-save enabled — no manual save button needed
              </div>
            </div>
          </div>

          {/* Status Indicators Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Status Indicators
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #e7e5e4' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 500,
                        color: '#78716c',
                        fontSize: '12px',
                      }}
                    >
                      State
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 500,
                        color: '#78716c',
                        fontSize: '12px',
                      }}
                    >
                      Color
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 500,
                        color: '#78716c',
                        fontSize: '12px',
                      }}
                    >
                      Use
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {states.status.map((status, i) => (
                    <tr
                      key={status.name}
                      style={{
                        borderBottom: i < states.status.length - 1 ? '1px solid #f5f5f4' : 'none',
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: status.color,
                              borderRadius: '3px',
                            }}
                          />
                          <span style={{ color: '#44403c', fontWeight: 500 }}>{status.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <code
                          style={{
                            fontFamily: typography.fonts.mono,
                            fontSize: '12px',
                            color: '#6495ED',
                          }}
                        >
                          {status.color}
                        </code>
                      </td>
                      <td style={{ padding: '12px', color: '#78716c' }}>{status.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inline badges */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #f5f5f4',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {states.status.map((status) => (
                <span
                  key={status.name}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: `${status.color}20`,
                    color:
                      status.name === 'Warning'
                        ? '#b8860b'
                        : status.name === 'Success'
                          ? '#4caf50'
                          : status.name === 'Error'
                            ? '#d32f2f'
                            : '#3d5fc2',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {status.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Notes & Special Contexts Section */}
        <div style={{ marginTop: '56px', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '24px',
            }}
          >
            Daily Notes & Special Contexts
          </h2>

          {/* Daily Notes Layout Diagram */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Daily Notes Layout
            </p>

            {/* Full Layout Mock */}
            <div
              style={{
                border: '2px solid #e7e5e4',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              {/* Header Navigation */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid #e7e5e4',
                  backgroundColor: '#fafaf9',
                  gap: '24px',
                }}
              >
                <button
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #e7e5e4',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#78716c',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ← Prior
                </button>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#292524',
                  }}
                >
                  Wed, Jan 8, 2026
                </div>
                <button
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #e7e5e4',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#78716c',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Next →
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#6495ED',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#fff',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Today
                </button>
              </div>

              {/* Content Area */}
              <div style={{ display: 'flex', minHeight: '200px' }}>
                {/* Editor */}
                <div
                  style={{
                    flex: 1,
                    padding: '20px 32px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#a8a29e', marginBottom: '12px' }}>
                    EDITOR CONTENT (fluid width)
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#292524',
                      marginBottom: '12px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Wednesday, January 8
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      color: '#57534e',
                      lineHeight: 1.6,
                    }}
                  >
                    <p style={{ marginBottom: '8px' }}>Morning standup notes...</p>
                    <p style={{ color: '#a8a29e' }}>Start typing to add content</p>
                  </div>
                </div>

                {/* Mini Calendar */}
                <div
                  style={{
                    width: '200px',
                    padding: '16px',
                    borderLeft: '1px solid #e7e5e4',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#a8a29e', marginBottom: '12px' }}>
                    MINI CALENDAR
                  </div>

                  {/* Calendar Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#44403c' }}>
                      January 2026
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#78716c',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CaretLeft size={14} />
                      </button>
                      <button
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#78716c',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CaretRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '2px',
                      fontSize: '11px',
                      textAlign: 'center',
                    }}
                  >
                    {/* Day headers */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div
                        key={i}
                        style={{
                          color: '#a8a29e',
                          padding: '4px',
                          fontWeight: 500,
                        }}
                      >
                        {d}
                      </div>
                    ))}
                    {/* Empty cells for offset */}
                    {[...Array(3)].map((_, i) => (
                      <div key={`empty-${i}`} style={{ padding: '4px' }} />
                    ))}
                    {/* Days */}
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      const hasNote = dailyNotes.miniCalendar.daysWithNotes.includes(day);
                      const isToday = day === 8;
                      return (
                        <div
                          key={day}
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            backgroundColor: isToday ? '#6495ED' : 'transparent',
                            color: isToday ? '#fff' : '#44403c',
                            fontWeight: isToday ? 600 : 400,
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                        >
                          {day}
                          {hasNote && !isToday && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '3px',
                                height: '3px',
                                backgroundColor: '#6495ED',
                                borderRadius: '50%',
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#78716c' }}>
              <strong style={{ color: '#44403c' }}>Keyboard:</strong>{' '}
              <kbd
                style={{
                  padding: '2px 6px',
                  fontFamily: typography.fonts.mono,
                  fontSize: '11px',
                  backgroundColor: '#fafaf9',
                  border: '1px solid #e7e5e4',
                  borderRadius: '4px',
                }}
              >
                T
              </kbd>{' '}
              to jump to Today
            </div>
          </div>

          {/* Regular Objects Panel */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                marginBottom: '16px',
              }}
            >
              Regular Objects — Right Panel
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {/* Right Panel Mock */}
              <div
                style={{
                  width: '220px',
                  border: '1px solid #e7e5e4',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e7e5e4',
                    backgroundColor: '#fafaf9',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#44403c' }}>
                    Backlinks
                  </div>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#6495ED',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Link size={12} />
                    Project Alpha
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#6495ED',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Link size={12} />
                    Meeting Notes Jan 5
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#6495ED',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Link size={12} />
                    Weekly Review
                  </div>
                </div>
              </div>

              {/* Panel Items List */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '12px', color: '#78716c', marginBottom: '12px' }}>
                  Right panel shows for non-daily objects:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dailyNotes.rightPanelRegular.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: '#44403c',
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          backgroundColor: '#6495ED',
                          borderRadius: '50%',
                        }}
                      />
                      <span>
                        <strong>{item}</strong>
                      </span>
                      <span style={{ color: '#a8a29e', fontSize: '12px' }}>
                        {item === 'Backlinks' && '— What links here'}
                        {item === 'Page info' && '— Created, modified, type'}
                        {item === 'Tags' && '— Associated tags'}
                        {item === 'Settings' && '— Object-specific options'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Component */}
        <div style={{ marginTop: '56px', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '24px',
            }}
          >
            Left Sidebar
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '32px',
              flexWrap: 'wrap',
            }}
          >
            {/* Sidebar Mock */}
            <div
              style={{
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                height: '380px',
              }}
            >
              {/* Top Section */}
              <div style={{ padding: '12px', borderBottom: '1px solid #e7e5e4' }}>
                {/* Search / Command Palette Trigger */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    backgroundColor: '#fafaf9',
                    border: '1px solid #e7e5e4',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '6px',
                  }}
                >
                  <MagnifyingGlass size={15} color="#a8a29e" />
                  <span style={{ fontSize: '13px', color: '#a8a29e', flex: 1 }}>Search...</span>
                  <kbd
                    style={{
                      padding: '2px 5px',
                      fontFamily: typography.fonts.mono,
                      fontSize: '10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e7e5e4',
                      borderRadius: '3px',
                      color: '#a8a29e',
                    }}
                  >
                    ⌘K
                  </kbd>
                </div>

                {/* Calendar Button */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 10px',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    color: '#44403c',
                    textAlign: 'left',
                    transition: 'background-color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafaf9';
                    e.currentTarget.style.borderColor = '#e7e5e4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <CalendarBlank size={15} color="#44403c" />
                  <span style={{ fontWeight: 500 }}>Calendar</span>
                </button>
              </div>

              {/* Types Section */}
              <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#a8a29e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                    padding: '0 8px',
                  }}
                >
                  Types
                </div>

                {/* Type Items */}
                {[
                  { icon: <FileText />, color: '#6495ED', name: 'Notes', count: 47 },
                  { icon: <CheckSquare />, color: '#81c784', name: 'Tasks', count: 12 },
                  { icon: <User />, color: '#ffb74d', name: 'People', count: 23 },
                  { icon: <Folder />, color: '#e57373', name: 'Projects', count: 8 },
                  { icon: <BookOpen />, color: '#91a7ff', name: 'Resources', count: 156 },
                ].map((type) => (
                  <SidebarTypeItem key={type.name} type={type} />
                ))}

                {/* New Type Button */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    color: '#a8a29e',
                    textAlign: 'left',
                    marginTop: '2px',
                    transition: 'color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#6495ED';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a8a29e';
                  }}
                >
                  <Plus size={14} />
                  <span>New Type</span>
                </button>
              </div>

              {/* Bottom Section */}
              <div
                style={{
                  padding: '8px 12px',
                  borderTop: '1px solid #e7e5e4',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0px',
                }}
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '5px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    color: '#78716c',
                    textAlign: 'left',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafaf9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Archive size={14} />
                  <span>Archive</span>
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '5px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    color: '#78716c',
                    textAlign: 'left',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafaf9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Gear size={14} />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Specs */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e7e5e4',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#78716c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    marginBottom: '16px',
                  }}
                >
                  Sidebar Specs
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, color: '#44403c', marginBottom: '4px' }}>
                      Width
                    </div>
                    <code style={{ fontFamily: typography.fonts.mono, color: '#6495ED' }}>
                      240px
                    </code>
                    <span style={{ color: '#78716c' }}> — collapsible</span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 500, color: '#44403c', marginBottom: '4px' }}>
                      Type Row Height
                    </div>
                    <code style={{ fontFamily: typography.fonts.mono, color: '#6495ED' }}>
                      ~28px
                    </code>
                    <span style={{ color: '#78716c' }}> — compact density</span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 500, color: '#44403c', marginBottom: '4px' }}>
                      Search Bar
                    </div>
                    <span style={{ color: '#78716c' }}>Opens command palette (⌘K)</span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 500, color: '#44403c', marginBottom: '4px' }}>
                      Calendar
                    </div>
                    <span style={{ color: '#78716c' }}>Opens today's daily note</span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 500, color: '#44403c', marginBottom: '4px' }}>
                      Type Items
                    </div>
                    <span style={{ color: '#78716c' }}>Icon + name, count on hover</span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 500, color: '#44403c', marginBottom: '4px' }}>
                      Bottom Actions
                    </div>
                    <span style={{ color: '#78716c' }}>Archive, Settings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Type Browser Component */}
        <div style={{ marginTop: '56px', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '24px',
            }}
          >
            Type Object Browser
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#78716c',
              marginBottom: '20px',
              maxWidth: '600px',
            }}
          >
            Database-style view for browsing objects of a specific type. Supports sorting,
            filtering, column visibility, multi-select, and inline editing.
          </p>

          <TypeBrowser />

          {/* Specs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                Fixed Columns
              </div>
              <div style={{ fontSize: '13px', color: '#44403c' }}>
                Checkbox (left) + Title — always visible, immovable
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                Column Actions
              </div>
              <div style={{ fontSize: '13px', color: '#44403c' }}>
                Click header → Sort, Filter, Hide
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                Row Hover
              </div>
              <div style={{ fontSize: '13px', color: '#44403c' }}>
                "Open" button on title, "..." menu on right
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#78716c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                Multi-Select
              </div>
              <div style={{ fontSize: '13px', color: '#44403c' }}>
                Bulk actions: Archive, Delete
              </div>
            </div>
          </div>
        </div>

        {/* Component Preview */}
        <div style={{ marginTop: '48px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534e',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              marginBottom: '20px',
            }}
          >
            Component Preview
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Card Component */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#292524',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                }}
              >
                Meeting Notes
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  color: '#57534e',
                  lineHeight: 1.5,
                  marginBottom: '12px',
                }}
              >
                Discussed Q1 roadmap priorities and timeline for the new feature rollout.
              </p>
              <span
                style={{
                  fontSize: '12px',
                  color: '#a8a29e',
                }}
              >
                Updated 2 hours ago
              </span>
            </div>

            {/* Buttons & Badges */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#78716c',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    fontWeight: 500,
                  }}
                >
                  Buttons
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    style={{
                      backgroundColor: '#6495ED',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#748ffc')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#6495ED')}
                  >
                    Primary Action
                  </button>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#6495ED',
                      border: '1px solid #6495ED',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Secondary
                  </button>
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#78716c',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    fontWeight: 500,
                  }}
                >
                  Status Badges
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      backgroundColor: '#81c78420',
                      color: '#4caf50',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Completed
                  </span>
                  <span
                    style={{
                      backgroundColor: '#ffb74d20',
                      color: '#f57c00',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    In Progress
                  </span>
                  <span
                    style={{
                      backgroundColor: '#e5737320',
                      color: '#d32f2f',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Overdue
                  </span>
                  <span
                    style={{
                      backgroundColor: '#6495ED20',
                      color: '#3d5fc2',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Info
                  </span>
                </div>
              </div>
            </div>

            {/* Code & Mono Demo */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: '#78716c',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  fontWeight: 500,
                }}
              >
                Monospace & Code
              </p>
              <div
                style={{
                  backgroundColor: '#f5f5f4',
                  borderRadius: '8px',
                  padding: '16px',
                  fontFamily: typography.fonts.mono,
                  fontSize: '13px',
                  color: '#44403c',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ color: '#78716c' }}>// Note metadata</div>
                <div>
                  <span style={{ color: '#6495ED' }}>id:</span> note_8f3k2m
                </div>
                <div>
                  <span style={{ color: '#6495ED' }}>created:</span> 2024-01-15
                </div>
                <div>
                  <span style={{ color: '#6495ED' }}>words:</span>{' '}
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>1,247</span>
                </div>
              </div>
            </div>

            {/* Form Elements */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: '#78716c',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  fontWeight: 500,
                }}
              >
                Form Elements
              </p>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#44403c',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Note Title
              </label>
              <input
                type="text"
                placeholder="Placeholder text..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e7e5e4',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  color: '#44403c',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6495ED')}
                onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
              />
              <input
                type="text"
                defaultValue="Weekly planning session"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e7e5e4',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  color: '#44403c',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6495ED')}
                onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            fontSize: '12px',
            color: '#a8a29e',
            marginTop: '48px',
            textAlign: 'center',
          }}
        >
          Click any swatch to copy hex value
        </p>
      </div>
    </div>
  );
}
