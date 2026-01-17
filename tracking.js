/**
 * Tracking System for Adeiv
 * Captures UTM parameters from URL and persists them in sessionStorage.
 * This allows tracking to survive page navigation (e.g. Landing Page -> Booking Page).
 */

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

export function initTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    let captured = false;

    UTM_PARAMS.forEach(param => {
        if (urlParams.has(param)) {
            const value = urlParams.get(param);
            sessionStorage.setItem(param, value);
            captured = true;
        }
    });

    if (captured) {
        console.log('✅ UTMs capturadas:', getStoredUtms());
    }
}

export function getStoredUtms() {
    const data = {};
    UTM_PARAMS.forEach(param => {
        const value = sessionStorage.getItem(param);
        if (value) {
            data[param] = value;
        }
    });
    return data;
}
