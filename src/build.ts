/**
 * The visible build label is deliberately kept in one module so every route
 * carries the same release identity. Static pages initialise it on load too.
 */
export const buildLabel = 'Built by Param Factory · v1.0.0 · polish 3';

export function renderBuildLabel() {
  document.querySelectorAll<HTMLElement>('[data-build-label]').forEach((element) => {
    element.textContent = buildLabel;
  });
}
