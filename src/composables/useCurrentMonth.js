import { ref, onMounted, onBeforeUnmount } from 'vue';
import { currentMonthKey } from '../utils/date.js';

/**
 * Reactive "YYYY-MM" of today. Refreshes when the tab becomes visible again
 * and once a minute, so a tab left open across midnight on the 1st rolls over
 * to the new month by itself.
 */
export function useCurrentMonth() {
  const nowMonth = ref(currentMonthKey());
  let timer = null;

  const refresh = () => {
    nowMonth.value = currentMonthKey();
  };

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      refresh();
    }
  };

  onMounted(() => {
    timer = setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', onVisibility);
  });

  onBeforeUnmount(() => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisibility);
  });

  return { nowMonth };
}
