/**
 * Created by matt_000 on 24/09/2018.
 */
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Defaults

const Tooltip = {
  text: false,
  css: {top: 0, left: 0},
  direction: 'tooltip--top',
  classes: ''
};

const dep = new Tracker.Dependency();
const offset = [10, 10];

const DIRECTION_MAP = {
  'n': 'tooltip--top',
  's': 'tooltip--bottom',
  'e': 'tooltip--right',
  'w': 'tooltip--left'
};

// Tooltip functions

const getTooltip = function() {
  dep.depend();
  return Tooltip;
};

const setTooltip = function(what, where) {
  if (where) { Tooltip.css = where; }
  Tooltip.text = what;
  return dep.changed();
};

const setPosition = function(position, direction) {
  Tooltip.css = position;
  if (direction) { Tooltip.direction = DIRECTION_MAP[direction]; }
  return dep.changed();
};

const setClasses = classes => Tooltip.classes = classes || '';

const hideTooltip = () => setTooltip(false);

const toggleTooltip = function() {
  if (getTooltip().text) { return hideTooltip(); } else { return showTooltip(null, $(this)); }
};

const positionTooltip = function($el) {
  let hasOffsetLeft, hasOffsetTop;
  const direction = $el.attr('data-tooltip-direction') || 'n';
  const $tooltip = $(".tooltip");

  const position = $el.offset();
  let offLeft = $el.attr('data-tooltip-left');
  let offTop = $el.attr('data-tooltip-top');

  if (_.isUndefined(offLeft)) {
    offLeft = 0;
  } else {
    hasOffsetLeft = true;
  }

  if (_.isUndefined(offTop)) {
    offTop = 0;
  } else {
    hasOffsetTop = true;
  }

  position.top = (() => { switch (direction) {
    case 'w': case 'e': return (center(vertically($tooltip, $el))) + offTop;
    case 'n': return position.top - $tooltip.outerHeight() - (hasOffsetTop ? offTop : offset[1]);
    case 's': return position.top + $el.outerHeight() + (hasOffsetTop ? offTop : offset[1]);
  } })();

  position.left = (() => { switch (direction) {
    case 'n': case 's': return (center(horizontally($tooltip, $el))) + offLeft;
    case 'w': return position.left - $tooltip.outerWidth() - (hasOffsetLeft ? offLeft : offset[0]);
    case 'e': return position.left + $el.outerWidth() + (hasOffsetLeft ? offLeft : offset[0]);
  } })();

  return setPosition(position, direction);
};

var showTooltip = function(evt, $el) {
  $el = $el || $(this);
  const viewport = $el.attr('data-tooltip-disable');

  if (viewport && _.isString(viewport)) {
    const mq = window.matchMedia(viewport);
    if (mq.matches) { return false; }
  }

  const content = (() => {
    let selector;
    if (selector = $el.attr('data-tooltip-element')) {
      const $target = $(selector);
      return $target.length && $target.html();
    } else {
      return $el.attr('data-tooltip');
    }
  })();

  setTooltip(content);
  setPosition({top: 0, left: 0});
  setClasses($el.attr('data-tooltip-classes'));

  return Tracker.afterFlush(() => positionTooltip($el));
};


// Positioning

var center = function(args) {
  const middle = args[0] + (args[1] / 2);
  return middle - Math.round(args[2] / 2);
};

var horizontally = ($el, $reference) => [$reference.offset().left, $reference.outerWidth(), $el.outerWidth()];

var vertically = ($el, $reference) => [$reference.offset().top, $reference.outerHeight(), $el.outerHeight()];

// Exports

const Tooltips = {
  disable: false,
  set: setTooltip,
  get: getTooltip,
  hide: hideTooltip,
  setPosition
};

// Enable/disable for viewports

Template.tooltips.onCreated(function() {
  this.disabled = new ReactiveVar(Tooltips.disable);

  if (Tooltips.disable && _.isString(Tooltips.disable)) {
    const mq = window.matchMedia(Tooltips.disable);
    this.disabled.set(mq.matches);

    return mq.addListener(changed => {
      return this.disabled.set(changed.matches);
    });
  }
});


// Template helpers

Template.tooltips.helpers({
  display() {
    const tip = getTooltip();

    if (Template.instance().disabled.get() === true) {
      return 'hide';
    }

    if (tip.text) { return 'show'; } else { return 'hide'; }
  },

  position() {
    const { css } = getTooltip();
    return `position: absolute; top: ${css.top}px; left: ${css.left}px;`;
  },

  content() {
    return getTooltip().text;
  },

  direction() {
    return getTooltip().direction;
  },

  classes() {
    return getTooltip().classes;
  }
});

// Init

Template.tooltip.onRendered(function() {

  return this.lastNode._uihooks = {
    insertElement(node, next) {
      return next.parentNode.insertBefore(node, next);
    },

    moveElement(node, next) {
      Tooltips.hide();
      return next.parentNode.insertBefore(node, next);
    },

    removeElement(node) {
      Tooltips.hide();
      return node.parentNode.removeChild(node);
    }
  };
});

Meteor.startup(function() {

  $(document).on('mouseover', '[data-tooltip]:not([data-tooltip-trigger]), [data-tooltip-element]:not([data-tooltip-trigger]), [data-tooltip-trigger="hover"]', showTooltip);

  $(document).on('mouseout', '[data-tooltip]:not([data-tooltip-trigger]), [data-tooltip-element]:not([data-tooltip-trigger]), [data-tooltip-trigger="hover"]', hideTooltip);

  $(document).on('click', '[data-tooltip-trigger="click"]', toggleTooltip);
  $(document).on('focus', '[data-tooltip-trigger="focus"]', showTooltip);
  $(document).on('blur', '[data-tooltip-trigger="focus"]', hideTooltip);
  $(document).on('tooltips:show', '[data-tooltip-trigger="manual"]', showTooltip);
  $(document).on('tooltips:hide', '[data-tooltip-trigger="manual"]', hideTooltip);
  return $(document).on('tooltips:toggle', '[data-tooltip-trigger="manual"]', toggleTooltip);
});
