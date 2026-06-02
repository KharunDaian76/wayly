// Single source of truth: re-export the design system's class merger so the app
// and @wayly/ui never diverge on Tailwind conflict resolution.
export { cn } from '@wayly/ui';
