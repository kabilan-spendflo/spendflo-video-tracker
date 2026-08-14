"use client";

import { useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { mountCalendar } from "@/lib/calendar";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";

export default function CalendarPanel() {
  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const periodLabelRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const todayRef = useRef(null);
  const viewMonthRef = useRef(null);
  const viewWeekRef = useRef(null);
  const addItemRef = useRef(null);

  useEffect(() => {
    const cleanup = mountCalendar(
      {
        root: rootRef.current,
        sidebar: sidebarRef.current,
        periodLabel: periodLabelRef.current,
        prevBtn: prevRef.current,
        nextBtn: nextRef.current,
        todayBtn: todayRef.current,
        viewMonthBtn: viewMonthRef.current,
        viewWeekBtn: viewWeekRef.current,
        addItemBtn: addItemRef.current,
      },
      db
    );
    return cleanup;
  }, []);

  return (
    <>
      <div className="tab-toolbar">
        <div className="cal-nav">
          <button ref={prevRef} type="button" className="cal-nav-btn"><ChevronLeftIcon /></button>
          <button ref={todayRef} type="button" className="cal-today-btn">Today</button>
          <button ref={nextRef} type="button" className="cal-nav-btn"><ChevronRightIcon /></button>
          <span ref={periodLabelRef} className="cal-period-label" />
        </div>
        <div className="view-toggle">
          <button ref={viewMonthRef} type="button" className="active">Month</button>
          <button ref={viewWeekRef} type="button">Week</button>
        </div>
        <button className="btn-primary" ref={addItemRef} type="button">
          <PlusIcon /> New item
        </button>
      </div>

      <div className="calendar-layout">
        <div className="calendar-sidebar" ref={sidebarRef} />
        <div className="calendar-grid-wrap" ref={rootRef} />
      </div>
    </>
  );
}
