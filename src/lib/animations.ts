import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * GSAP Motion Graphics Utilities for RestOS Lite
 * Provides performant, zero-scroll-reliant UI entrance, counters,
 * and responsive motion graphics.
 */

export const gsapMotion = {
  /**
   * Staggered entrance animation for cards, list items, and bento grids
   */
  staggerEntrance: (targets: gsap.TweenTarget, options: { stagger?: number; delay?: number; duration?: number; y?: number } = {}) => {
    const { stagger = 0.06, delay = 0, duration = 0.45, y = 16 } = options;
    return gsap.fromTo(
      targets,
      { opacity: 0, y, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
        clearProps: 'transform',
      }
    );
  },

  /**
   * Smooth number counter ticker using GSAP
   */
  counter: (
    element: HTMLElement | null,
    targetValue: number,
    options: { duration?: number; prefix?: string; suffix?: string; isCurrency?: boolean } = {}
  ) => {
    if (!element) return;
    const { duration = 0.75, prefix = '', suffix = '', isCurrency = false } = options;
    const currentNum = { val: 0 };

    return gsap.to(currentNum, {
      val: targetValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (isCurrency) {
          element.innerText = `${prefix}₹${Math.round(currentNum.val).toLocaleString('en-IN')}${suffix}`;
        } else {
          element.innerText = `${prefix}${Math.round(currentNum.val).toLocaleString('en-IN')}${suffix}`;
        }
      },
    });
  },

  /**
   * Micro-interaction button pop feedback
   */
  buttonPop: (target: gsap.TweenTarget) => {
    gsap.timeline()
      .to(target, { scale: 0.94, duration: 0.08, ease: 'power1.in' })
      .to(target, { scale: 1.03, duration: 0.15, ease: 'back.out(2)' })
      .to(target, { scale: 1, duration: 0.1, ease: 'power1.out' });
  },

  /**
   * Continuous breathing pulse for real-time Neon DB active status
   */
  pulseLiveBadge: (target: gsap.TweenTarget) => {
    return gsap.to(target, {
      scale: 1.06,
      opacity: 0.85,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  },

  /**
   * Receipt unfold animation for bills and kitchen tickets
   */
  unfoldReceipt: (target: gsap.TweenTarget) => {
    return gsap.fromTo(
      target,
      { scaleY: 0, opacity: 0, transformOrigin: 'top center' },
      { scaleY: 1, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform' }
    );
  },

  /**
   * Slide fade notification banner or modal
   */
  slideNotification: (target: gsap.TweenTarget) => {
    return gsap.fromTo(
      target,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }
    );
  },
};

/**
 * React Hook for GSAP Stagger Entrance
 */
export function useGsapStagger(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string,
  deps: any[] = []
) {
  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsapMotion.staggerEntrance(elements);
    }, containerRef);

    return () => ctx.revert();
  }, deps);
}

/**
 * React Hook for GSAP Number Counter
 */
export function useGsapCounter(
  elementRef: React.RefObject<HTMLElement | null>,
  value: number,
  options: { duration?: number; prefix?: string; suffix?: string; isCurrency?: boolean } = {}
) {
  useEffect(() => {
    if (!elementRef.current) return;
    const tween = gsapMotion.counter(elementRef.current, value, options);
    return () => {
      tween?.kill();
    };
  }, [value, options.prefix, options.suffix, options.isCurrency]);
}
