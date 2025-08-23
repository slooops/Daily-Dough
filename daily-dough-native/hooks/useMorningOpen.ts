import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useMorningOpen() {
  const [showMorningAnimation, setShow] = useState(false);
  const [hasSeenToday, setSeen] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const today = new Date().toDateString();
        const lastOpen = await AsyncStorage.getItem("lastOpenDate");
        if (lastOpen !== today) {
          setShow(true);
          await AsyncStorage.setItem("lastOpenDate", today);
        }
      } catch {}
    };
    check();
  }, []);

  const onAnimationComplete = useCallback(() => {
    setShow(false);
    setSeen(true);
  }, []);

  return { showMorningAnimation, hasSeenToday, onAnimationComplete };
}
