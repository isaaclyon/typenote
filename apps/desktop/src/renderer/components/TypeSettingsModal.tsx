import * as React from 'react';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  IconPicker,
  ColorPicker,
  getIconByName,
} from '@typenote/design-system';
import type { CreateObjectTypeInput } from '@typenote/api';

export interface TypeSettingsModalProps {
  open: boolean;
  onClose: () => void;
  typeId?: string | null;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  pluralName: string;
  icon: string | null;
  color: string | null;
}

export const TypeSettingsModal: React.FC<TypeSettingsModalProps> = ({
  open,
  onClose,
  typeId,
  mode,
  onSuccess,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    pluralName: '',
    icon: 'FileText',
    color: '#6495ED',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  // Load existing type data if editing
  React.useEffect(() => {
    if (open && mode === 'edit' && typeId) {
      setLoading(true);
      setError(null);

      // Fetch type by ID (we need to add this IPC handler)
      // For now, we'll fetch all types and find the one we need
      window.typenoteAPI
        .listObjectTypes()
        .then((result) => {
          if (result.success) {
            const type = result.result.find((t) => t.id === typeId);
            if (type) {
              setFormData({
                name: type.name,
                pluralName: type.pluralName ?? '',
                icon: type.icon,
                color: type.color,
              });
            } else {
              setError('Type not found');
            }
          } else {
            setError(result.error.message);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load type');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (open && mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        pluralName: '',
        icon: 'FileText',
        color: '#6495ED',
      });
      setError(null);
    }
  }, [open, mode, typeId]);

  // Auto-generate key from name (PascalCase)
  const generateKey = (name: string): string => {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (formData.name.length > 128) {
      setError('Name must be 128 characters or less');
      return;
    }

    if (formData.pluralName && formData.pluralName.length > 128) {
      setError('Plural name must be 128 characters or less');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        const key = generateKey(formData.name);

        const input: CreateObjectTypeInput = {
          key,
          name: formData.name.trim(),
          pluralName: formData.pluralName.trim() || undefined,
          icon: formData.icon || undefined,
          color: formData.color || undefined,
        };

        const result = await window.typenoteAPI.createObjectType(input);

        if (result.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(result.error.message);
        }
      } else if (typeId) {
        // Update existing type
        const result = await window.typenoteAPI.updateObjectType(typeId, {
          name: formData.name.trim(),
          pluralName: formData.pluralName.trim() || undefined,
          icon: formData.icon,
          color: formData.color,
        });

        if (result.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(result.error.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const SelectedIconButton = () => {
    const IconComponent = formData.icon ? getIconByName(formData.icon) : null;
    return (
      <button
        type="button"
        onClick={() => setShowIconPicker(!showIconPicker)}
        className="flex h-10 items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
      >
        {IconComponent ? (
          <>
            <IconComponent className="h-4 w-4" />
            <span>{formData.icon}</span>
          </>
        ) : (
          <span className="text-gray-500">Select icon...</span>
        )}
      </button>
    );
  };

  const SelectedColorButton = () => (
    <button
      type="button"
      onClick={() => setShowColorPicker(!showColorPicker)}
      className="flex h-10 items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
    >
      {formData.color ? (
        <>
          <div
            className="h-4 w-4 rounded-sm border border-gray-300"
            style={{ backgroundColor: formData.color }}
          />
          <span>{formData.color}</span>
        </>
      ) : (
        <span className="text-gray-500">Select color...</span>
      )}
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title={mode === 'create' ? 'Create Type' : 'Edit Type'}
          subtitle={
            mode === 'create' ? 'Create a custom object type' : 'Edit object type properties'
          }
        />

        <ModalContent>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Project, Client, Task"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Plural Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Plural Name <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Projects, Clients, Tasks"
                value={formData.pluralName}
                onChange={(e) => setFormData({ ...formData, pluralName: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Icon <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <SelectedIconButton />
              {showIconPicker && (
                <div className="mt-2 rounded-sm border border-gray-200 p-3">
                  <IconPicker
                    value={formData.icon}
                    onChange={(iconName) => {
                      setFormData({ ...formData, icon: iconName });
                      setShowIconPicker(false);
                    }}
                    maxHeight={300}
                  />
                </div>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Color <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <SelectedColorButton />
              {showColorPicker && (
                <div className="mt-2 rounded-sm border border-gray-200 p-3">
                  <ColorPicker
                    value={formData.color}
                    onChange={(color) => {
                      setFormData({ ...formData, color });
                      setShowColorPicker(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
            )}
          </div>
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
