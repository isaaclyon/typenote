# Design System Discussion

Invoke the design-principles skill for focused design discussion or UI implementation guidance.

**Arguments:** $ARGUMENTS

---

## Context

You are now operating with the **design-principles** skill active. This skill enforces precise, crafted design for enterprise software following "Jony Ive-level precision with intentional personality."

---

## If Arguments Provided

The user wants to discuss or implement: **$ARGUMENTS**

Analyze this request through the lens of the design-principles skill:

1. **Identify the design direction** — Which personality fits this component/screen?
   - Precision & Density (Linear-style)
   - Warmth & Approachability (Notion-style)
   - Sophistication & Trust (Stripe-style)
   - Boldness & Clarity (Vercel-style)
   - Utility & Function (GitHub-style)
   - Data & Analysis (dashboard-style)

2. **Apply core craft principles** — Consider:
   - 4px grid alignment
   - Symmetrical padding
   - Border radius consistency
   - Depth/elevation strategy
   - Typography hierarchy
   - Color usage (meaning only, not decoration)

3. **Check for anti-patterns** — Ensure we avoid:
   - Dramatic shadows
   - Large border radius (16px+)
   - Asymmetric padding
   - Spring/bouncy animations
   - Multiple accent colors

4. **Provide concrete guidance** — Give specific CSS values, component structure, or implementation recommendations.

---

## If No Arguments Provided

Start a design system conversation by asking:

> "What aspect of design would you like to discuss? I can help with:
>
> - **Component design** — Building a specific UI element
> - **Screen layout** — Planning a page or view structure
> - **Design tokens** — Establishing spacing, colors, typography
> - **Design review** — Critiquing existing UI against principles
> - **Pattern selection** — Choosing the right design direction"

Use the AskUserQuestion tool to let them choose their focus area.

---

## TypeNote Context

When designing for TypeNote specifically, consider:

- **Product type:** Local-first knowledge management app
- **Users:** Power users who value efficiency and focus
- **Emotional job:** Trust, focus, clarity
- **Suggested direction:** Blend of **Precision & Density** + **Utility & Function**
- **Color foundation:** Cool neutrals (slate/blue-gray) or pure neutrals
- **Depth strategy:** Borders-only or subtle single shadows

---

## Output

Provide actionable design guidance that includes:

- Specific CSS values aligned to the 4px grid
- Component structure recommendations
- Typography choices from the defined scale
- Color usage rationale
