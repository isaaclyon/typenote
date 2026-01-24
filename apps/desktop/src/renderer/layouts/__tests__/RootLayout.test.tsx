import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { RootLayout } from '../RootLayout.js';

const mockNavigate = vi.fn();
const mockCreateObject = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/notes/01' }),
  useParams: () => ({ objectId: '01', typeKey: undefined }),
  Outlet: () => null,
}));

vi.mock('@typenote/design-system', () => ({
  AppShell: ({
    sidebarContent,
    children,
  }: {
    sidebarContent?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div>
      {sidebarContent}
      {children}
    </div>
  ),
  SidebarHeader: ({ onNewClick }: { onNewClick?: () => void }) => (
    <button type="button" data-testid="new-note" onClick={onNewClick}>
      New
    </button>
  ),
  SidebarSection: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  SidebarItem: ({ label, active }: { label: string; active?: boolean }) => (
    <div data-label={label} data-active={active ? 'true' : 'false'} />
  ),
  SidebarFooter: () => null,
  CommandPalette: () => null,
  PlaceholderAction: () => null,
}));

vi.mock('../../hooks/useSidebarData.js', () => ({
  useSidebarData: () => ({
    typeCounts: [
      {
        typeKey: 'Page',
        typeName: 'Pages',
        typeIcon: 'file-text',
        typeColor: '#6B7280',
        count: 1,
      },
    ],
    pinnedObjects: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useCommandPalette.js', () => ({
  useCommandPalette: () => ({
    isOpen: false,
    setIsOpen: vi.fn(),
    recentItems: [],
    actions: [],
    searchResultsItems: [],
    searchQuery: '',
    handleSearchChange: vi.fn(),
    handleSelect: vi.fn(),
  }),
}));

vi.mock('../../hooks/useCreateObject.js', () => ({
  useCreateObject: () => ({
    createObject: mockCreateObject,
    isCreating: false,
    error: null,
    _queryClient: undefined,
  }),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateObject.mockClear();
  });

  it('marks Page as active when viewing notes route', () => {
    const { container } = render(<RootLayout />);
    const pageItem = container.querySelector('[data-label="Pages"]');

    expect(pageItem).not.toBeNull();
    expect(pageItem?.getAttribute('data-active')).toBe('true');
  });

  it('creates a Page when clicking new note', () => {
    const { getAllByTestId } = render(<RootLayout />);

    const newNoteButtons = getAllByTestId('new-note');
    // Multiple buttons may render (e.g., React StrictMode), click the first one
    const firstButton = newNoteButtons[0];
    expect(firstButton).toBeDefined();
    if (firstButton) {
      fireEvent.click(firstButton);
    }

    expect(mockCreateObject).toHaveBeenCalledWith('Page', 'Untitled', {});
  });
});
