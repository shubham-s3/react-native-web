/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type { PlatformMethods } from '../../types';
import type { TextProps } from './types';

import * as React from 'react';
import createElement from '../createElement';
import * as forwardedProps from '../../modules/forwardedProps';
import pick from '../../modules/pick';
import useElementLayout from '../../modules/useElementLayout';
import useMergeRefs from '../../modules/useMergeRefs';
import usePlatformMethods from '../../modules/usePlatformMethods';
import useResponderEvents from '../../modules/useResponderEvents';
import RTLContext from '../../modules/RTLContext';
import StyleSheet from '../StyleSheet';
import TextAncestorContext from './TextAncestorContext';

const forwardPropsList = {
  ...forwardedProps.defaultProps,
  ...forwardedProps.accessibilityProps,
  ...forwardedProps.clickProps,
  ...forwardedProps.focusProps,
  ...forwardedProps.keyboardProps,
  ...forwardedProps.mouseProps,
  ...forwardedProps.touchProps,
  ...forwardedProps.styleProps,
  href: true,
  lang: true,
  pointerEvents: true
};

const pickProps = (props) => pick(props, forwardPropsList);

const Text: React.AbstractComponent<TextProps, HTMLElement & PlatformMethods> = React.forwardRef(
  (props, forwardedRef) => {
    const {
      dir,
      hrefAttrs,
      numberOfLines,
      onClick,
      onLayout,
      onPress,
      onMoveShouldSetResponder,
      onMoveShouldSetResponderCapture,
      onResponderEnd,
      onResponderGrant,
      onResponderMove,
      onResponderReject,
      onResponderRelease,
      onResponderStart,
      onResponderTerminate,
      onResponderTerminationRequest,
      onScrollShouldSetResponder,
      onScrollShouldSetResponderCapture,
      onSelectionChangeShouldSetResponder,
      onSelectionChangeShouldSetResponderCapture,
      onStartShouldSetResponder,
      onStartShouldSetResponderCapture,
      selectable,
      ...rest
    } = props;

    const hasTextAncestor = React.useContext(TextAncestorContext);
    const hostRef = React.useRef(null);
    const isRTL = React.useContext(RTLContext);

    useElementLayout(hostRef, onLayout);
    useResponderEvents(hostRef, {
      onMoveShouldSetResponder,
      onMoveShouldSetResponderCapture,
      onResponderEnd,
      onResponderGrant,
      onResponderMove,
      onResponderReject,
      onResponderRelease,
      onResponderStart,
      onResponderTerminate,
      onResponderTerminationRequest,
      onScrollShouldSetResponder,
      onScrollShouldSetResponderCapture,
      onSelectionChangeShouldSetResponder,
      onSelectionChangeShouldSetResponderCapture,
      onStartShouldSetResponder,
      onStartShouldSetResponderCapture
    });

    const handleClick = React.useCallback(
      (e) => {
        if (onClick != null) {
          onClick(e);
        } else if (onPress != null) {
          e.stopPropagation();
          onPress(e);
        }
      },
      [onClick, onPress]
    );

    let component = hasTextAncestor ? 'span' : 'div';
    const supportedProps = pickProps(rest);
    supportedProps.dir = dir;
    // 'auto' by default allows browsers to infer writing direction (root elements only)
    if (!hasTextAncestor) {
      supportedProps.dir = dir != null ? dir : 'auto';
    }

    if (onClick || onPress) {
      supportedProps.onClick = handleClick;
    }

    supportedProps.isRTL = isRTL || dir === 'rtl';

    supportedProps.style = [
      numberOfLines != null && { WebkitLineClamp: numberOfLines },
      hasTextAncestor === true ? styles.textHasAncestor$raw : styles.text$raw,
      numberOfLines != null && styles.textMultiLine,
      props.style,
      selectable === true && styles.selectable,
      selectable === false && styles.notSelectable,
      onPress && styles.pressable
    ];

    if (props.href != null) {
      component = 'a';
      if (hrefAttrs != null) {
        const { download, rel, target } = hrefAttrs;
        if (download != null) {
          supportedProps.download = download;
        }
        if (rel != null) {
          supportedProps.rel = rel;
        }
        if (typeof target === 'string') {
          supportedProps.target = target.charAt(0) !== '_' ? '_' + target : target;
        }
      }
    }

    const platformMethodsRef = usePlatformMethods(supportedProps);
    const setRef = useMergeRefs(hostRef, platformMethodsRef, forwardedRef);

    supportedProps.ref = setRef;

    const element = (
      <RTLContext.Provider value={supportedProps.isRTL}>
        {createElement(component, supportedProps)}
      </RTLContext.Provider>
    );

    return hasTextAncestor ? (
      element
    ) : (
      <TextAncestorContext.Provider value={true}>{element}</TextAncestorContext.Provider>
    );
  }
);

Text.displayName = 'Text';

const textStyle = {
  backgroundColor: 'transparent',
  border: '0 solid black',
  boxSizing: 'border-box',
  color: 'black',
  display: 'inline',
  font: '14px System',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  textAlign: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word'
};

const styles = StyleSheet.create({
  text$raw: textStyle,
  textHasAncestor$raw: {
    ...textStyle,
    color: 'inherit',
    font: 'inherit',
    whiteSpace: 'inherit'
  },
  // See #13
  textMultiLine: {
    display: '-webkit-box',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitBoxOrient: 'vertical'
  },
  notSelectable: {
    userSelect: 'none'
  },
  selectable: {
    userSelect: 'text'
  },
  pressable: {
    cursor: 'pointer'
  }
});

export default Text;
