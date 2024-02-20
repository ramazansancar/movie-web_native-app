import { useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Text } from "~/components/ui/Text";
import { convertMilliSecondsToSeconds } from "~/lib/number";
import { useCaptionsStore } from "~/stores/captions";
import { usePlayerStore } from "~/stores/player/store";

export const captionIsVisible = (
  start: number,
  end: number,
  delay: number,
  currentTime: number,
) => {
  const delayedStart = start / 1000 + delay;
  const delayedEnd = end / 1000 + delay;
  return (
    Math.max(0, delayedStart) <= currentTime &&
    Math.max(0, delayedEnd) >= currentTime
  );
};

export const CaptionRenderer = () => {
  const isIdle = usePlayerStore((state) => state.interface.isIdle);
  const selectedCaption = useCaptionsStore((state) => state.selectedCaption);
  const delay = useCaptionsStore((state) => state.delay);
  const status = usePlayerStore((state) => state.status);

  const translateY = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const transitionValue = useDerivedValue(() => {
    return isIdle ? 50 : 0;
  }, [isIdle]);

  useAnimatedReaction(
    () => {
      return transitionValue.value;
    },
    (newValue) => {
      translateY.value = withSpring(newValue);
    },
  );

  const visibleCaptions = useMemo(
    () =>
      selectedCaption?.data.filter(({ start, end }) =>
        captionIsVisible(
          start,
          end,
          delay,
          status?.isLoaded
            ? convertMilliSecondsToSeconds(status.positionMillis)
            : 0,
        ),
      ),
    [selectedCaption, delay, status],
  );

  if (!status?.isLoaded || !selectedCaption || !visibleCaptions?.length)
    return null;

  return (
    <Animated.View
      className="absolute bottom-24 rounded bg-black/50 px-4 py-1 text-center leading-normal"
      style={animatedStyles}
    >
      {visibleCaptions?.map((caption) => (
        <View key={caption.index}>
          <Text>{caption.text}</Text>
        </View>
      ))}
    </Animated.View>
  );
};