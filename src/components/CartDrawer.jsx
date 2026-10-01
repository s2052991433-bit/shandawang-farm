import { useLayoutEffect, useRef, useState } from "react";
import { stepSpring } from "../ui/motion.mjs";

const focusable = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';

export function CartDrawer({ open, close, children }) {
  const [present, setPresent] = useState(open);
  const panel = useRef(null);
  const overlay = useRef(null);
  const backdrop = useRef(null);
  const motion = useRef({ position: 1, velocity: 0 });
  const closeRef = useRef(close);
  closeRef.current = close;

  useLayoutEffect(() => { if (open) setPresent(true); }, [open]);

  useLayoutEffect(() => {
    if (!present || !open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const siblings = [...overlay.current.parentElement.children].filter(element => element !== overlay.current && !element.classList.contains("toast"));
    const previousInert = siblings.map(element => element.inert);
    siblings.forEach(element => { element.inert = true; });
    const elements = () => [...panel.current.querySelectorAll(focusable)].filter(element => element.getClientRects().length);
    const focusFirst = () => (elements()[0] || panel.current)?.focus({ preventScroll: true });
    focusFirst();
    const handleKeys = event => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const targets = elements();
      const first = targets[0], last = targets.at(-1);
      if (!first) { event.preventDefault(); panel.current.focus(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const containFocus = event => { if (!panel.current?.contains(event.target)) focusFirst(); };
    document.addEventListener("keydown", handleKeys);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("keydown", handleKeys);
      document.removeEventListener("focusin", containFocus);
      document.body.style.overflow = previousOverflow;
      siblings.forEach((element, index) => { element.inert = previousInert[index]; });
      if (previousFocus?.isConnected && !previousFocus.closest("[inert]")) previousFocus.focus({ preventScroll: true });
    };
  }, [open, present]);

  useLayoutEffect(() => {
    if (!present) return;
    const target = open ? 0 : 1;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame, previousTime;
    const paint = () => {
      panel.current.style.transform = `translateX(${motion.current.position * 100}%)`;
      backdrop.current.style.opacity = String(1 - motion.current.position);
    };
    const finish = () => {
      motion.current = { position: target, velocity: 0 };
      paint();
      if (!open) setPresent(false);
    };
    const animate = time => {
      if (preference.matches) { finish(); return; }
      const seconds = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      motion.current = stepSpring(motion.current.position, motion.current.velocity, target, seconds);
      paint();
      if (Math.abs(motion.current.position - target) < 0.001 && Math.abs(motion.current.velocity) < 0.01) finish();
      else frame = requestAnimationFrame(animate);
    };
    paint();
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [open, present]);

  if (!present) return null;
  return <div className="overlay" ref={overlay} aria-hidden={!open || undefined} style={{ pointerEvents: open ? "auto" : "none" }}>
    <button ref={backdrop} className="overlay-backdrop" aria-label="关闭购物袋" tabIndex={-1} onClick={close} />
    <aside ref={panel} className="cart-panel" role="dialog" aria-modal={open || undefined} aria-label="购物袋" tabIndex={-1} inert={!open}>
      {children}
    </aside>
  </div>;
}
