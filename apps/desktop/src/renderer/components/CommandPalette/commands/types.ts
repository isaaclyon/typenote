/**
 * Command types for the command palette.
 *
 * Commands represent actions the user can take: navigating to an object,
 * creating a new object, or executing an action.
 */

// -----------------------------------------------------------------------------
// Base Command
// -----------------------------------------------------------------------------

export type CommandType = 'navigation' | 'creation' | 'action';

export interface BaseCommand {
  /** Unique identifier for the command */
  id: string;
  /** Command type discriminator */
  type: CommandType;
  /** Display label */
  label: string;
  /** Optional description shown below label */
  description?: string | undefined;
  /** Lucide icon name */
  icon?: string | undefined;
  /** Keywords for fuzzy matching */
  keywords?: string[] | undefined;
}

// -----------------------------------------------------------------------------
// Command Variants
// -----------------------------------------------------------------------------

/** Navigate to an existing object */
export interface NavigationCommand extends BaseCommand {
  type: 'navigation';
  objectId: string;
  objectType: string;
}

/** Create a new object of a specific type */
export interface CreationCommand extends BaseCommand {
  type: 'creation';
  typeKey: string;
  defaultTitle?: string | undefined;
}

/** Execute an arbitrary action */
export interface ActionCommand extends BaseCommand {
  type: 'action';
  handler: () => void | Promise<void>;
}

/** Union of all command types */
export type Command = NavigationCommand | CreationCommand | ActionCommand;

// -----------------------------------------------------------------------------
// Command Groups
// -----------------------------------------------------------------------------

export interface CommandGroup {
  heading: string;
  commands: Command[];
}
