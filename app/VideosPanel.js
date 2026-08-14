"use client";

import { useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { mountTracker } from "@/lib/tracker";
import { SearchIcon, ListIcon, BoardIcon, PlusIcon } from "./icons";

export default function VideosPanel() {
  const rootRef = useRef(null);
  const statsRef = useRef(null);
  const searchRef = useRef(null);
  const viewTableRef = useRef(null);
  const viewBoardRef = useRef(null);
  const addBtnRef = useRef(null);

  useEffect(() => {
    const cleanup = mountTracker(
      {
        root: rootRef.current,
        statsRow: statsRef.current,
        searchInput: searchRef.current,
        viewTableBtn: viewTableRef.current,
        viewBoardBtn: viewBoardRef.current,
        addVideoBtn: addBtnRef.current,
      },
      db
    );
    return cleanup;
  }, []);

  return (
    <>
      <div className="tab-toolbar">
        <div className="search">
          <SearchIcon />
          <input ref={searchRef} placeholder="Search videos..." />
        </div>
        <div className="view-toggle">
          <button ref={viewTableRef} type="button" className="active">
            <ListIcon /> List
          </button>
          <button ref={viewBoardRef} type="button">
            <BoardIcon /> Board
          </button>
        </div>
        <button className="btn-primary" ref={addBtnRef} type="button">
          <PlusIcon /> New video
        </button>
      </div>

      <div className="stats" ref={statsRef} />
      <div ref={rootRef} />
    </>
  );
}
