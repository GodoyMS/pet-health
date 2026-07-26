/**
 * Strips Google's default InfoWindow chrome so popups can render edge-to-edge
 * with our own rounded card styling. Inject once per map via a `<style>` tag.
 */
export const INFO_WINDOW_CSS = `
.gm-style .gm-style-iw-c { padding: 0 !important; border-radius: 16px !important; overflow: hidden !important; box-shadow: 0 12px 34px -8px rgba(0,0,0,0.35) !important; }
.gm-style .gm-style-iw-d { overflow: hidden !important; padding: 0 !important; max-height: none !important; }
.gm-style .gm-style-iw-c button.gm-ui-hover-effect { display: none !important; }
.gm-style .gm-style-iw-tc::after { background: var(--card, #fff) !important; }
`;
