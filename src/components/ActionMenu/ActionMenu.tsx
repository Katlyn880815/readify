"use client";
import { useState } from "react";
import styles from "./ActionMenu.module.css";

import ActionIcon from "../ActionIcon/ActionIcon";
import MarkerColorPlatte from "../MarkerColorPlatte/MarkerColorPlatte";

import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/hooks";
import { setDeleteHighlightMode } from "@/lib/redux/features/readSlice";
import useFirestore from "@/hooks/firebase_db/useFirestore";
import {
  setActionMenuToggle,
  setIsAddNoteBlockOpen,
} from "@/lib/redux/features/readSlice";
import { addHighlight } from "@/lib/redux/features/noteSlice";

import getSelectionData from "@/utils/getSelectionData";

import {
  faHighlighter,
  faNoteSticky,
  faEllipsis,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { fromRange } from "xpath-range";
import highlightHelper from "@/utils/highlightHelper";
import findChapterElement from "@/utils/findIndexOfParentElement";

const ActionMenu = ({
  xPosition,
  yPosition,
}: {
  xPosition: number;
  yPosition: number;
}) => {
  const [isColorPlatteOpen, setIsColorPlatteOpen] = useState(false);
  const [isAddNoteBlockOpen, setIsAddNoteBlockOpen] = useState(false);
  const firestore = useFirestore();
  const dispatch = useAppDispatch();
  const {
    markerColor,
    isDeleteMode,
    deleteHighlightID,
    currentBook,
    currentCategory,
    currentChapter,
  } = useAppSelector((state) => state.read);
  const { user } = useAuth();

  const handleHighlight = () => {
    const selectionData = getSelectionData();
    if (selectionData) {
      const { range, startContainer, endContainer, selectedText } =
        selectionData;
      const root = document.querySelector("#viewer");
      const xpath = fromRange(range, root);
      const { start, startOffset, end, endOffset } = xpath;
      const highlightId = Math.random().toString(36).substring(2);
      const highlight = highlightHelper();

      highlight.highlightText(
        startContainer,
        endContainer,
        startOffset,
        endOffset,
        highlightId,
        markerColor
      );

      if (currentChapter) {
        firestore.setDocument(
          `/users/${user.uid}/${currentCategory}/${
            currentBook?.bookId
          }/${currentChapter.replaceAll("/", "")}`,
          highlightId,
          {
            highlightId,
            markerColor,
            text: selectedText,
            range: xpath,
          }
        );
        firestore.setDocument(
          `/users/${user.uid}/${currentCategory}/${currentBook?.bookId}/highlights`,
          highlightId,
          {
            id: highlightId,
            text: selectedText,
            markerColor,
          }
        );
        dispatch(
          setDeleteHighlightMode({
            isDeleteMode: true,
            deleteHighlightID: highlightId,
          })
        );
        dispatch(
          addHighlight({ id: highlightId, text: selectedText, markerColor })
        );
      }
    }
  };

  const handleAddNote = () => {
    handleHighlight();
    setIsAddNoteBlockOpen(true);
    console.log("增加筆記函式執行！");
  };

  console.log(isAddNoteBlockOpen);

  const handleDeleteHighlight = async () => {
    try {
      console.log(deleteHighlightID);
      if (deleteHighlightID) {
        const highlight = highlightHelper();
        highlight.deleteHighlight(deleteHighlightID);
        await firestore.deleteDocument(
          `/users/${user.uid}/${currentCategory}/${
            currentBook?.bookId
          }/${currentChapter?.replaceAll("/", "")}/${deleteHighlightID}`
        );
        dispatch(setActionMenuToggle(false));
      }
    } catch (e) {
      console.log("Delete fail");
    }
  };

  return (
    <div className={styles.action_menu_container}>
      <div
        className={styles.action_menu}
        style={{
          position: "absolute",
          top: `${yPosition}px`,
          left: `${xPosition}px`,
          zIndex: 100,
        }}
      >
        {isAddNoteBlockOpen && <NoteForm />}
        {!isAddNoteBlockOpen && (
          <div className={styles.action_menu_inner}>
            {isDeleteMode ? (
              <ActionIcon
                iconProp={faTrashCan}
                promptText="Delete highlight"
                position="top"
                onAction={() => handleDeleteHighlight()}
              />
            ) : (
              <ActionIcon
                iconProp={faHighlighter}
                promptText="Create highlight"
                position={isColorPlatteOpen ? "bottom" : "top"}
                onAction={() => handleHighlight()}
                color={markerColor}
              />
            )}

            <ActionIcon
              iconProp={faNoteSticky}
              promptText="Add note"
              position={isColorPlatteOpen ? "bottom" : "top"}
              onAction={() => handleAddNote()}
            />
            <ActionIcon
              iconProp={faEllipsis}
              promptText="Pick marker color"
              position={isColorPlatteOpen ? "bottom" : "top"}
              onAction={() => setIsColorPlatteOpen(!isColorPlatteOpen)}
            />
            {isColorPlatteOpen && <MarkerColorPlatte />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionMenu;

const NoteForm = () => {
  return (
    <div>
      <form>
        <textarea></textarea>
        <button>cancel</button>
        <button>Save</button>
      </form>
    </div>
  );
};
