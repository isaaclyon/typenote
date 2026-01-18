---
paths: "**/*.ts", "**/*.tsx"
---

# TypeScript Strictness Rules

This project uses maximum TypeScript strictness. These rules are enforced in `tsconfig.base.json`.

## Required Compiler Options

All of these must remain enabled:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "noPropertyAccessFromIndexSignature": true,
  "useUnknownInCatchVariables": true,
  "verbatimModuleSyntax": true
}
```

## Required Patterns

### No `any` Type

**Bad:** Using `any` to bypass type checking

```typescript
// DON'T: Escape hatch that defeats the purpose
function process(data: any): any {
  return data.someProperty;
}
```

**Good:** Use proper types or `unknown` with narrowing

```typescript
// DO: Proper typing
function process(data: ProcessInput): ProcessOutput {
  return { result: data.someProperty };
}

// DO: unknown with type guard
function processUnknown(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return String(data.name);
  }
  throw new Error('Invalid data');
}
```

### Handle Indexed Access

With `noUncheckedIndexedAccess`, array/object access returns `T | undefined`:

**Bad:** Assuming index exists

```typescript
// DON'T: arr[0] is string | undefined, not string
const items: string[] = ['a', 'b'];
const first: string = items[0]; // Type error!
```

**Good:** Check for undefined

```typescript
// DO: Handle undefined case
const first = items[0];
if (first !== undefined) {
  console.log(first.toUpperCase());
}

// DO: Or use non-null assertion if you're certain
const first = items[0]!; // Only if you're 100% sure
```

### Explicit Optional Properties

With `exactOptionalPropertyTypes`, `undefined` and optional are different:

**Bad:** Mixing undefined and optional

```typescript
// DON'T: These are different!
interface User {
  name?: string; // Property may be missing
}

const user: User = { name: undefined }; // Type error!
```

**Good:** Be explicit about intent

```typescript
// DO: Optional means "may not exist"
interface User {
  name?: string;
}
const user: User = {}; // OK

// DO: Or explicitly allow undefined
interface User {
  name?: string | undefined;
}
const user: User = { name: undefined }; // OK
```

### Unknown in Catch Variables

With `useUnknownInCatchVariables`, caught errors are `unknown`:

**Bad:** Assuming error shape

```typescript
// DON'T: error is unknown, not Error
try {
  doSomething();
} catch (error) {
  console.log(error.message); // Type error!
}
```

**Good:** Narrow the error type

```typescript
// DO: Type guard for errors
try {
  doSomething();
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

### No Non-Null Assertions (Prefer)

Avoid `!` when possible:

```typescript
// AVOID: Non-null assertion
const value = map.get(key)!;

// PREFER: Explicit check
const value = map.get(key);
if (value === undefined) {
  throw new Error(`Key not found: ${key}`);
}
```

## ESLint Enforcement

These rules are also enforced by ESLint:

- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-non-null-assertion`: error
