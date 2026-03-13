import { useEffect, useRef } from 'react';

/**
 * Hook to handle hourly desktop notifications to remind users to track their time.
 * @param {boolean} isAuthenticated - Whether the user is currently logged in.
 */
export const usePwsReminders = (isAuthenticated) => {
  const lastNotificationTime = useRef(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check availability and request permission
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
          }
        });
      }
    }

    const checkAndNotify = () => {
      const now = Date.now();
      const oneHour = 3600000;
      
      // If an hour has passed, or if the time jumped significant (PC wake from sleep)
      if (now - lastNotificationTime.current >= oneHour) {
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("PWS Time Track Reminder", {
              body: "Don't forget to check your job timings! Are you still working?",
              requireInteraction: true,
              icon: '/logo.png', // Assuming a logo exists in public folder
              tag: 'time-track-hourly-reminder' // Prevents notification stacking
            });
            lastNotificationTime.current = now;
          } catch (err) {
            console.error("Failed to send notification:", err);
          }
        }
      }
    };

    // Check every minute to handle wake-from-sleep drift accurately
    const interval = setInterval(checkAndNotify, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);
};
