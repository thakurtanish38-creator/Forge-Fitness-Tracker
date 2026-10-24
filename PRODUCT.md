# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who work out at the gym and want one simple place to track food, calories, hydration, workouts, and progress.

## Product Purpose

FORGE helps people build consistent fitness habits by bringing daily nutrition and activity tracking together. Success means making it easier to understand daily habits, follow a personal goal, and recognize progress over time.

## Positioning

An approachable, gamified daily tracker that combines food, workouts, hydration, and progress in one place.

## Operating Context

People use FORGE to set a bodyweight and fitness goal, then log meals, workouts, and water during their day. They return to a dashboard for daily calorie and macro totals, and to Progress for streaks, badges, monthly activity, and weight trends. Users can revisit their goals and appearance settings at any time.

## Capabilities and Constraints

- Account creation and login, goal setup, and password updates.
- Daily food logging with calorie and macro totals; the expanded built-in food list supports category, ingredient/name search, vegetarian and non-vegetarian filters.
- Editable food portions with calorie and macro estimates scaled from each reference serving; values are approximate and not verified against an external food database.
- Gym, cardio, and sports workout logging with editable sets/reps or duration and optional strength-training load; workout energy remains an estimate.
- Recent workout history based on saved daily logs.
- Flexible daily hydration entries in millilitres, editable/removable drink records, and a user-configurable goal; legacy glass counts migrate at 250 ml per glass.
- Progress tracking with dated, editable weight entries, selectable 7/30/90-day charts, streaks, earned badges, and a monthly activity summary.
- Light and dark themes with user-selectable accent colours.
- Personalizable calorie and macro targets.
- Account and tracking data currently persist in browser local storage; new passwords use browser-side PBKDF2 hashing and legacy plaintext passwords are migrated after successful login. This is not server authentication; cross-device sync is not available.

## Brand Commitments

- The product name is FORGE.
- Use a dumbbell SVG as the primary FORGE mark; retain the existing mascot as a decorative character.
- The default appearance is white and navy; retain dark mode and user-changeable accent colours. Do not use orange or amber accents.
- Keep the experience encouraging and focused on consistent effort rather than guilt.

## Evidence on Hand

- The working React application and its tracker data in `src/App.jsx` and `src/data.js`.
- The existing food list, exercise choices, goal calculations, and browser-local persistence are implemented product behavior.
- No testimonials, customer research, external nutrition validation, or other promotional evidence is provided. Do not invent any.

## Product Principles

- Keep food, workouts, hydration, and progress together in one daily routine.
- Make meaningful progress visible through useful feedback and milestones.
- Support personal goals without treating imperfect days as failure.
- Preserve the existing tracker features and locally stored user progress.

## Accessibility & Inclusion

- Use accessible contrast in light and dark themes.
- Provide touch targets of at least 44px.
- Respect the user's reduced-motion preference.
- Keep the responsive experience usable on mobile screens.
