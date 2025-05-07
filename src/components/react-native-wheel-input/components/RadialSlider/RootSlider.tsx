import React, { useEffect, useRef, useState } from 'react';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  NumberProp,
} from 'react-native-svg';
import { View, Platform, StyleSheet, TextInput, Text, TouchableWithoutFeedback, TouchableHighlight } from 'react-native';
import type { RadialSliderProps } from './types';
import { styles } from './styles';
import { useSliderAnimation, useRadialSlider } from './hooks';
import { defaultProps } from './SliderDefaultProps';
import LineContent from './LineContent';
import { HStack } from '@/components/ui/hstack';

const RadialSlider = (props: RadialSliderProps & typeof defaultProps) => {

  const {
    step,
    radius,
    sliderWidth,
    sliderTrackColor,
    linearGradient,
    thumbRadius,
    thumbBorderColor,
    thumbColor,
    thumbBorderWidth,
    style,
    markerLineSize,
    contentStyle,
    min,
    max,
  } = props;

  const { panResponder, value, setValue, curPoint, currentRadian, prevValue } =
    useSliderAnimation(props);

  const {
    svgSize,
    containerRef,
    startPoint,
    endPoint,
    startRadian,
    radianValue,
    isRadialCircleVariant,
    centerValue,
  } = useRadialSlider(props);



  const onLayout = () => {
    const ref = containerRef.current as any;
    if (ref) {
      ref.measure((_x: any, _y: any, _width: any, _height: any) => { });
    }
  };

  const onPressButtons = (type: string) => {
    if (type === 'up' && max > value) {
      setValue((prevState: number) => {
        const calculatedValue = prevState + step;
        const roundedValue = parseFloat(calculatedValue.toFixed(1));
        return roundedValue;
      });
    } else if (type === 'down' && min < value) {
      setValue((prevState: number) => {
        const calculatedValue = prevState - step;
        const roundedValue = parseFloat(calculatedValue.toFixed(1));
        prevValue.current = roundedValue;
        return roundedValue;
      });
    }
  };

  const circleXPosition = isRadialCircleVariant
    ? centerValue < value
      ? -7
      : 4
    : 0;

  const strokeLinecap = isRadialCircleVariant ? 'square' : 'round';



  const handleChangeText = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const numericText = text.replace(/[^0-9.]/g, "")

    // Validate the input
    if (numericText === "" || numericText === ".") {
      setValue(0)
      return
    }
    let numericValue = Number.parseFloat(numericText)
    if (numericValue < min) numericValue = min
    if (numericValue > max) numericValue = max

    setValue(numericValue)
  }




  // Handle blur
  const handleBlur = () => {
    const numericValue = Number.parseFloat(value!.toString())
    if (numericValue < min) {
      setValue(min)
    } else if (numericValue > max) {
      setValue(max)
    } else {
      props.onChange(numericValue)
    }
  }






  return (
    <View
      onLayout={onLayout}
      ref={containerRef as any}
      style={[styles.container, style, { width: svgSize, height: svgSize }]}
      testID="slider-view">
      <Svg
        width={svgSize + markerLineSize / 2 - (Platform.OS === 'web' ? 20 : 0)}
        height={svgSize + markerLineSize / 2}
        viewBox={`-${markerLineSize / 2} -${markerLineSize / 2} ${svgSize + markerLineSize
          } ${svgSize + markerLineSize}`}
        preserveAspectRatio="none">
        <Defs>
          <LinearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="gradient">
            {linearGradient.map(
              (
                item: {
                  offset: NumberProp | undefined;
                  color: string | undefined;
                },
                index: React.Key | null | undefined
              ) => (
                <Stop key={index} offset={item.offset} stopColor={item.color} />
              )
            )}
          </LinearGradient>
        </Defs>
        <LineContent {...props} value={value} />
        <>
          <Path
            strokeWidth={sliderWidth}
            stroke={sliderTrackColor}
            fill="none"
            strokeLinecap={strokeLinecap}
            d={`M${startPoint.x},${startPoint.y} A ${radius},${radius},0,${startRadian - radianValue >= Math.PI ? '1' : '0'
              },1,${endPoint.x},${endPoint.y}`}
          />
          <Path
            strokeWidth={sliderWidth}
            stroke="url(#gradient)"
            fill="none"
            strokeLinecap={strokeLinecap}
            d={`M${startPoint.x},${startPoint.y} A ${radius},${radius},0,${startRadian - currentRadian >= Math.PI ? '1' : '0'
              },1,${curPoint.x},${curPoint.y}`}
          />
          <Circle
            cx={curPoint.x + circleXPosition}
            cy={curPoint.y}
            r={thumbRadius}
            fill={thumbColor || thumbBorderColor}
            stroke={thumbBorderColor}
            strokeWidth={thumbBorderWidth}
            {...panResponder.panHandlers}
          />
        </>
      </Svg>
      <View style={[styles.content, contentStyle]} pointerEvents="box-none">


        <HStack className='justify-center items-center'>
          <Text className="text-typography-800 font-bold text-3xl ">
            £
          </Text>
          <TextInput
            value={value.toString()}
            onChangeText={handleChangeText}
            className="text-typography-700 font-bold text-3xl "
            keyboardType="numeric"
            onBlur={handleBlur}

          />

        </HStack>
      </View>
    </View>
  );
};

RadialSlider.defaultProps = defaultProps;
export default RadialSlider;