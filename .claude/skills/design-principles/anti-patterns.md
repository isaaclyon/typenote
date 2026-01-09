# Anti-Patterns & Standards

## Navigation Context

Screens need grounding. A data table floating in space feels like a component demo, not a product.

### Include:

- **Navigation** — sidebar or top nav showing where you are in the app
- **Location indicator** — breadcrumbs, page title, or active nav state
- **User context** — who's logged in, what workspace/org

### Sidebar Tip

Consider using the same background as the main content area. Linear, Supabase, and Vercel rely on a subtle border for separation rather than different background colors. This reduces visual weight and feels more unified.

---

## Dark Mode Considerations

Dark interfaces have different needs:

### Borders over shadows

Shadows are less visible on dark backgrounds. Lean more on borders for definition. A border at 10-15% white opacity might look nearly invisible but it's doing its job — resist the urge to make it more prominent.

### Adjust semantic colors

Status colors (success, warning, error) often need to be slightly desaturated or adjusted for dark backgrounds to avoid feeling harsh.

### Same structure, different values

The hierarchy system (foreground → secondary → muted → faint) still applies, just with inverted values.

---

## Anti-Patterns

### Never Do This

| Anti-Pattern                                  | Why                                        |
| --------------------------------------------- | ------------------------------------------ |
| Dramatic drop shadows (`0 25px 50px...`)      | Feels dated, heavy, unprofessional         |
| Large border radius (16px+) on small elements | Cartoonish, inconsistent with craft        |
| Asymmetric padding without clear reason       | Looks sloppy, breaks visual rhythm         |
| Pure white cards on colored backgrounds       | Creates harsh contrast, feels disconnected |
| Thick borders (2px+) for decoration           | Heavy-handed, reduces sophistication       |
| Excessive spacing (margins > 48px)            | Wastes space, loses information density    |
| Spring/bouncy animations                      | Playful for enterprise, feels unserious    |
| Gradients for decoration                      | Dated, distracting, reduces clarity        |
| Multiple accent colors                        | Confusing, dilutes meaning of color        |

---

## Validation Questions

Before shipping, always question:

- [ ] "Did I think about what this product needs, or did I default?"
- [ ] "Does this direction fit the context and users?"
- [ ] "Does this element feel crafted?"
- [ ] "Is my depth strategy consistent and intentional?"
- [ ] "Are all elements on the grid?"

---

## The Standard

Every interface should look designed by a team that obsesses over 1-pixel differences.

Not stripped — **crafted**.

And designed for its specific context.

### Context Drives Aesthetic

| Product Type          | Wants                    |
| --------------------- | ------------------------ |
| Developer tool        | Precision and density    |
| Collaborative product | Warmth and space         |
| Financial product     | Trust and sophistication |

Let the product context guide the aesthetic.

### The Goal

**Intricate minimalism with appropriate personality.**

Same quality bar, context-driven execution.
