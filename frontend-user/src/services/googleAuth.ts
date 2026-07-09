declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: 'signin' | 'signup' | 'use';
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getDismissedReason: () => string;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
          }) => void) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
          storeCredential: (
            credential: string,
            callback: () => void
          ) => void;
          cancel: () => void;
          revoke: (
            hint: string,
            callback: (response: { error?: string }) => void
          ) => void;
          onGoogleLibraryLoad: () => void;
        };
      };
    };
  }
}

/**
 * Initialize Google Identity Services for the One Tap or popup flow.
 * Call this once when the app loads.
 */
export function initGoogleAuth(): Promise<void> {
  return new Promise((resolve) => {
    // If GIS is already loaded, resolve immediately
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    // Wait for the library to load
    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve()
    }, 10000)
  })
}

/**
 * Trigger the Google One Tap / popup flow and return the credential token.
 * Uses GIS buttonless prompt to open the account selector.
 */
export function requestGoogleCredential(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error('Google Identity Services not loaded'))
      return
    }

    // Set a timeout
    const timeout = setTimeout(() => {
      window.google?.accounts?.id.cancel()
      reject(new Error('Google login timed out'))
    }, 60000)

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        clearTimeout(timeout)
        if (response.credential) {
          resolve(response.credential)
        } else {
          reject(new Error('No credential received from Google'))
        }
      },
      cancel_on_tap_outside: false,
      context: 'signin',
      use_fedcm_for_prompt: true,
    })

    // Trigger the Google One Tap / popup UI
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        clearTimeout(timeout)
        reject(new Error('Google sign-in popup was blocked. Please allow popups for this site.'))
      }
      if (notification.isSkippedMoment()) {
        clearTimeout(timeout)
        reject(new Error('Google sign-in was skipped'))
      }
    })
  })
}
