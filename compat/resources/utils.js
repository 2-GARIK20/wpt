'use strict';

// Creates a div element, appends it to the document body and removes the
// created element during test cleanup.
function createDiv(test) {
  const element = document.createElement('div');
  element.classList.add('baseStyle');
  document.body.appendChild(element);
  test.add_cleanup(() => {
    element.remove();
  });
  return element;
}

// Adds an event handler for |handlerName| (calling |callback|) to the given
// |target|, that will automatically be cleaned up at the end of the test.
function addTestScopedEventHandler(test, target, handlerName, callback) {
  assert_regexp_match(
      handlerName, /^on/, 'Event handler names must start with "on"');
  assert_equals(target[handlerName], null,
                `${handlerName} must be supported and not previously set`);
  target[handlerName] = callback;
  // We need this cleaned up even if the event handler doesn't run.
  test.add_cleanup(() => {
    if (target[handlerName])
      target[handlerName] = null;
  });
}

// Adds an event listener for |type| (calling |callback|) to the given
// |target|, that will automatically be cleaned up at the end of the test.
function addTestScopedEventListener(test, target, type, callback) {
  target.addEventListener(type, callback);
  // We need this cleaned up even if the event handler doesn't run.
  test.add_cleanup(() => {
    target.removeEventListener(type, callback);
  });
}

// Returns a promise that will resolve once the passed event (|eventName|) has
// triggered and one more animation frame has happened. Automatically chooses
// between an event handler or event listener based on whether |eventName|
// begins with 'on'.
function waitForEventThenAnimationFrame(test, div, eventName) {
  return new Promise((resolve, _) => {
    const eventFunc = eventName.startsWith('on')
        ? addTestScopedEventHandler : addTestScopedEventListener;
    eventFunc(test, div, eventName, () => {
      // rAF once to give the event under test time to come through.
      requestAnimationFrame(resolve);
    });
  });
}
