# Particle-Led Homepage Wireframe

## Experience Direction

The homepage should feel like a calm AI interface waking up around the visitor. The existing particle field is the primary visual system: particles create space, react to scroll/load/page movement, and guide attention instead of sitting behind static content.

## Current First Slice

- Keep the page visually quiet on initial load.
- Keep the center particle-free circle as the main stage.
- Remove the top bento navigation buttons.
- Keep the light/dark theme toggle.

## Home Sequence

### 1. Load State

- Particles start scattered around the edges.
- The center remains empty for a short beat.
- A soft convergence/ripple moves through the particle field, implying the interface is focusing.

### 2. Intro State

- Minimal central identity appears, not a paragraph.
- Candidate copy:
  - `Sandy`
  - `Generative AI Developer`
  - `LLMs. Automation. Data Products.`
- Text should feel dimensional through depth, blur, lighting, or layered motion rather than heavy decorative 3D objects.

### 3. Scroll Cue

- No large button.
- A small edge cue or particle current hints that the page can continue.
- On scroll, particles should shift direction and open a path into the next section.

### 4. Section Transitions

- Each section gets its own particle behavior:
  - About: particles pull into a readable halo around the copy.
  - Projects: particles cluster into nodes/cards around featured work.
  - Experience: particles form a timeline path.
  - Contact: particles settle into a stable, low-motion field.

## Navigation Direction

- Avoid floating top bento buttons for now.
- Consider later:
  - scroll-progress rail
  - compact command/menu button
  - particle-reactive section markers
  - keyboard-friendly overlay navigation

## Motion Rules

- The particle system should lead every major transition.
- Text should be short and timed with particle movement.
- Motion must respect `prefers-reduced-motion`.
- The page should remain readable in both light and dark mode.
