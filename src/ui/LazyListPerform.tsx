// LazyListItem.tsx
import { useEffect, useRef, useState } from "react";

export default function LazyListItem({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // solo una vez
        }
      },
      { threshold: 0.1 } // 10% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className=" ">
      {isVisible ? children : "Cargando..."}
    </div>
  );
}
