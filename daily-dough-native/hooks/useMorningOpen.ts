import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useMorningOpen() {
  const [showMorningAnimation, setShow] = useState(false);
  const [hasSeenToday, setSeen] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const now = new Date();
        if (!now || isNaN(now.getTime())) {
          console.warn("⚠️ Invalid date in useMorningOpen, skipping");
          return;
        }

        const today = now.toDateString();
        if (!today) {
          console.warn("⚠️ Failed to get dateString in useMorningOpen");
          return;
        }

        const lastOpen = await AsyncStorage.getItem("lastOpenDate");
        if (lastOpen !== today) {
          setShow(true);
          await AsyncStorage.setItem("lastOpenDate", today);
        }
      } catch (error) {
        console.error("❌ Error in useMorningOpen:", error);
      }
    };
    check();
  }, []);

  const onAnimationComplete = useCallback(() => {
    setShow(false);
    setSeen(true);
  }, []);

  return { showMorningAnimation, hasSeenToday, onAnimationComplete };
}
