import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

// see react-native-marquee for the original code

export const Marquee = ({
  children,
  style,
  marqueeDelay = 1500,
  easing,
  duration = 3000,
  loop = true,
}) => {
  const containerRef = useRef();
  const contentRef = useRef();
  const [animating, setAnimating] = useState(false);
  const [width, setWidth] = useState();
  const [animatedValue] = useState(new Animated.Value(0));

  const calcMetrics = async () => {
    try {
      const measureWidth = (node) =>
        new Promise(
          function (resolve) {
            node.current.measure((x, y, w) => {
              return resolve(w);
            });
          }.bind(this)
        );
      const [containerWidth, contentWidth] = await Promise.all([
        measureWidth(containerRef),
        measureWidth(contentRef),
      ]);
      setWidth(contentWidth - containerWidth);
      return [];
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (contentRef && containerRef) {
      setTimeout(async () => {
        await calcMetrics();
      }, marqueeDelay);
    }
  }, [contentRef, containerRef]);

  useEffect(() => {
    if (width > 0 && !animating) {
      startAnimation();
    }
  }, [width]);

  const stopAnimation = () => {
    setAnimating(false);
  };

  const resetAnimation = () => {
    stopAnimation();
    setTimeout(() => {
      animatedValue.setValue(0);
      startAnimation();
    }, marqueeDelay);
  };

  const startAnimation = () => {
    setAnimating(true);
    Animated.timing(animatedValue, {
      toValue: -width,
      duration: duration,
      easing: easing,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        if (loop) {
          resetAnimation();
        } else {
          stopAnimation();
        }
      }
    });
  };

  return (
    <View style={[styles.container]}>
      <ScrollView
        ref={containerRef}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        scrollEnabled={false}
        onContentSizeChange={() => calcMetrics()}
      >
        <Animated.View
          ref={contentRef}
          style={[
            style,
            {
              transform: [{ translateX: animatedValue }],
              flexDirection: "row",
            },
          ]}
        >
          {children}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
});
