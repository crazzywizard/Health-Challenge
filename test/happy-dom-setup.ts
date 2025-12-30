/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobalWindow } from 'happy-dom';

const window = new GlobalWindow();
globalThis.window = window as any;
globalThis.document = window.document as any;
globalThis.navigator = window.navigator as any;
globalThis.location = window.location as any;
globalThis.HTMLAnchorElement = window.HTMLAnchorElement as any;
globalThis.HTMLElement = window.HTMLElement as any;
globalThis.Node = window.Node as any;
globalThis.Text = window.Text as any;
globalThis.MutationObserver = window.MutationObserver as any;
globalThis.Element = window.Element as any;
globalThis.localStorage = window.localStorage as any;
globalThis.sessionStorage = window.sessionStorage as any;
// Add more as needed
