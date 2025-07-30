// LazyListItem.tsx
import { memo, useEffect, useRef, useState } from 'react';

function LazyListItem({
  children,
  skeleton,
}: {
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }, // 10% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref}>
      {/* {isVisible ? children : skeleton ? skeleton : "Cargando"} */}
      {isVisible ? children : 'Cargando'}
    </div>
  );
}

export default memo(LazyListItem);
