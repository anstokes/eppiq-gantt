import React, { SyntheticEvent, useRef, useEffect } from "react";

// Styles
import styles from "./horizontal-scroll.module.css";

export const HorizontalScroll: React.FC<{
  datumListWidth: number;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
  scroll: number;
  svgWidth: number;
  rtl: boolean;
}> = ({ scroll, svgWidth, datumListWidth, rtl, onScroll }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scroll;
    }
  }, [scroll]);

  return (
    <div
      dir="ltr"
      style={{
        margin: rtl
          ? `0px ${datumListWidth}px 0px 0px`
          : `0px 0px 0px ${datumListWidth}px`,
      }}
      className={styles.scrollWrapper}
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div style={{ width: svgWidth }} className={styles.scroll} />
    </div>
  );
};
