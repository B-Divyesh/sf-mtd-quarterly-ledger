/**
 * Watch a registration created in this page session. Capturing `installing`
 * during updatefound matters: ServiceWorkerRegistration clears that property
 * as soon as the worker reaches installed/waiting.
 */
export function watchForServiceWorkerUpdate(
  registration: Pick<ServiceWorkerRegistration, 'installing' | 'addEventListener'>,
  hasController: () => boolean,
  announce: () => void
) {
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    installing?.addEventListener('statechange', () => {
      if (installing.state === 'installed' && hasController()) announce();
    });
  });
}
