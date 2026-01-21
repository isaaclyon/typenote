/**
 * Icon bundle for slash commands.
 * Separated from Editor.tsx to reduce import clutter and enable tree-shaking.
 */

// Phosphor icons for slash commands
import { TextT } from '@phosphor-icons/react/dist/ssr/TextT';
import { TextHOne } from '@phosphor-icons/react/dist/ssr/TextHOne';
import { TextHTwo } from '@phosphor-icons/react/dist/ssr/TextHTwo';
import { TextHThree } from '@phosphor-icons/react/dist/ssr/TextHThree';
import { ListBullets } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ListNumbers } from '@phosphor-icons/react/dist/ssr/ListNumbers';
import { ListChecks } from '@phosphor-icons/react/dist/ssr/ListChecks';
import { Quotes } from '@phosphor-icons/react/dist/ssr/Quotes';
import { Code } from '@phosphor-icons/react/dist/ssr/Code';
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus';
import { Table } from '@phosphor-icons/react/dist/ssr/Table';
// Callout icons
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { Lightbulb } from '@phosphor-icons/react/dist/ssr/Lightbulb';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr/WarningCircle';
// Math icon
import { MathOperations } from '@phosphor-icons/react/dist/ssr/MathOperations';
// Embed icon
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
// Image icon
import { ImageSquare } from '@phosphor-icons/react/dist/ssr/ImageSquare';

import type { SlashCommandIconBundle } from '../hooks/useEditorExtensions.js';

export const slashCommandIcons: SlashCommandIconBundle = {
  TextT,
  TextHOne,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  ListChecks,
  Quotes,
  Code,
  Minus,
  Table,
  Info,
  Warning,
  Lightbulb,
  WarningCircle,
  MathOperations,
  StackSimple,
  ImageSquare,
};
