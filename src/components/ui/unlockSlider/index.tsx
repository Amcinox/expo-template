import React, { useRef, useState } from "react";
import { View, PanResponder, Animated, ViewStyle } from "react-native";

/**
 * Props interface for the UnlockSlider component
 */
interface UnlockSliderProps {
  /** Direction of slide: left-to-right (true) or right-to-left (false) */
  isLeftToRight?: boolean;
  /** Style for the container of children elements */
  childrenContainer?: ViewStyle;
  /** Style for the main container */
  containerStyle?: ViewStyle;
  /** Style for the sliding element container */
  slideOverStyle?: ViewStyle;
  /** Whether to change opacity during slide */
  isOpacityChangeOnSlide?: boolean;
  /** Custom element to use as the sliding thumb */
  thumbElement?: React.ReactNode;
  /** Callback when slider reaches the end */
  onEndReached?: () => void;
  /** Callback when slider reaches halfway */
  onHalfReached?: () => void;
  /** Callback when slider is reset */
  onReset?: () => void;
  /** Primary color for the progress bar */
  primaryColor?: string;
  /** Background color of the slider */
  backgroundColor?: string;
  /** Child elements to render inside the slider */
  children?: React.ReactNode;
}

/**
 * Default styles for the container
 */
const DEFAULT_CONTAINER_STYLE: ViewStyle = {
  borderRadius: 5,
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "center",
  opacity: 1,
  backgroundColor: "#444659",
  width: "100%",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.37,
  shadowRadius: 7.49,
  elevation: 12,
};

/**
 * Default thumb element
 */
const DEFAULT_THUMB_ELEMENT = (
  <View
    style={{
      width: 56,
      height: "100%",
      borderRadius: 2,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#104983",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    }}
  >


  </View >
);

/**
 * UnlockSlider - A customizable slider component for React Native
 * 
 * This component provides a slider that can be unlocked by sliding from one end to the other.
 * It supports customization of colors, slide direction, and callback functions.
 */
export default function UnlockSlider({
  isLeftToRight = true,
  childrenContainer = {},
  containerStyle = DEFAULT_CONTAINER_STYLE,
  slideOverStyle,
  isOpacityChangeOnSlide = false,
  thumbElement = DEFAULT_THUMB_ELEMENT,
  onEndReached = () => { },
  onHalfReached = () => { },
  onReset = () => { },
  primaryColor = "#104983",
  children,
}: UnlockSliderProps) {
  // Refs for persistent values
  const totalWidthRef = useRef(0);
  const canReachEndRef = useRef(true);
  const canReachHalfRef = useRef(true);

  // State
  const [squareWidth, setSquareWidth] = useState(58);
  const [childOpacity, setChildOpacity] = useState(1);

  // Animated values
  const offsetX = useRef(new Animated.Value(0)).current;
  const followProgress = useRef(new Animated.Value(0)).current;

  /**
   * Calculate margin based on total width and square width
   */
  const getMargin = () => totalWidthRef.current - squareWidth * 1.025;

  /**
   * Reset the slider to initial position
   */
  const resetBar = () => {
    Animated.parallel([
      Animated.timing(offsetX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(followProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();

    setChildOpacity(1);
    onReset();
  };

  /**
   * Handler for when slider reaches halfway
   */
  const handleHalfReached = () => {
    if (canReachHalfRef.current) {
      onHalfReached();
      canReachHalfRef.current = false;
    }
  };

  /**
   * Handler for when slider reaches the end
   */
  const handleEndReached = () => {
    if (canReachEndRef.current) {
      onEndReached();
      canReachEndRef.current = false;
      resetBar();
    }
  };

  /**
   * Handle left to right sliding
   */
  const handleLeftToRightSlide = (gestureState: any) => {
    const margin = getMargin();

    if (gestureState.dx <= 0) {
      // Moving backward
      offsetX.setValue(gestureState.dx);
      followProgress.setValue(0);
      setChildOpacity(isOpacityChangeOnSlide ? 0.5 - gestureState.dx / margin : 1);
    } else if (gestureState.dx > 0 && gestureState.dx <= margin) {
      // Moving forward within bounds
      offsetX.setValue(gestureState.dx);
      followProgress.setValue(Math.max(0, gestureState.dx));
      setChildOpacity(isOpacityChangeOnSlide ? 0.5 - gestureState.dx / margin : 1);

      // Check for halfway point
      if (gestureState.dx >= margin / 2) {
        handleHalfReached();
      } else {
        onReset();
        canReachHalfRef.current = true;
      }
    } else if (gestureState.dx > margin) {
      // Completed slide
      setChildOpacity(isOpacityChangeOnSlide ? 0 : 1);
      followProgress.setValue(margin);
      handleEndReached();
    }
  };

  /**
   * Handle right to left sliding
   */
  const handleRightToLeftSlide = (gestureState: any) => {
    const margin = getMargin();

    if (gestureState.dx < -margin) {
      // Completed slide
      setChildOpacity(isOpacityChangeOnSlide ? 0 : 1);
      followProgress.setValue(margin);
      handleEndReached();
    } else if (gestureState.dx < 0) {
      // Moving within bounds
      offsetX.setValue(gestureState.dx);
      followProgress.setValue(Math.min(margin, Math.abs(gestureState.dx)));
      setChildOpacity(isOpacityChangeOnSlide ? 1 - Math.abs(gestureState.dx) / margin : 1);

      // Check for halfway point
      if (Math.abs(gestureState.dx) >= margin / 2) {
        handleHalfReached();
      } else {
        onReset();
        canReachHalfRef.current = true;
      }
    } else {
      // Moving backward
      offsetX.setValue(gestureState.dx);
      followProgress.setValue(0);
      setChildOpacity(1);
    }
  };

  // Pan responder for handling touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => !canReachEndRef.current,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        // Reset flags and position
        canReachEndRef.current = true;
        canReachHalfRef.current = true;
        offsetX.setValue(0);
        followProgress.setValue(0);
      },

      onPanResponderMove: (_, gestureState) => {
        if (isLeftToRight) {
          handleLeftToRightSlide(gestureState);
        } else {
          handleRightToLeftSlide(gestureState);
        }
      },

      onPanResponderRelease: () => {
        resetBar();
        canReachEndRef.current = true;
        canReachHalfRef.current = true;
      },

      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  // Calculate the progress width based on slider movement
  const progressWidth = followProgress.interpolate({
    inputRange: [0, Math.max(1, getMargin())],
    outputRange: [0, totalWidthRef.current || 0],
    extrapolate: 'clamp'
  });

  return (
    <View
      onLayout={(event) => {
        totalWidthRef.current = event.nativeEvent.layout.width;
      }}
      style={[
        containerStyle,
        {
          alignItems: isLeftToRight ? "flex-start" : "flex-end",
          overflow: "hidden",
        },
      ]}
    >
      {/* Progress bar */}
      <Animated.View
        style={{
          position: "absolute",
          zIndex: -9,
          width: progressWidth,
          height: 58,
          borderRadius: 5,
          backgroundColor: primaryColor,
          overflow: "hidden"
        }}
      />

      {/* Thumb element */}
      <Animated.View
        onLayout={(event) => {
          setSquareWidth(event.nativeEvent.layout.width);
        }}
        style={[
          {
            transform: [{ translateX: offsetX }],
          },
          {
            height: 58
          },
          slideOverStyle,
        ]}
        {...panResponder.panHandlers}
      >
        {thumbElement}
      </Animated.View>

      {/* Children container */}
      <View
        style={[
          {
            alignSelf: "center",
            position: "absolute",
            zIndex: -1,
            backgroundColor: "transparent",
            opacity: isOpacityChangeOnSlide ? childOpacity * 2 : 1,
          },
          childrenContainer,
        ]}
      >
        {children}
      </View>
    </View>
  );
}