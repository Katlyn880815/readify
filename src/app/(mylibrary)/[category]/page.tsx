"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

/* COMPONENTS */
import Topbar from "@/components/Topbar/Topbar";
import BookList from "@/components/BookList/BookList";
import Spinner from "@/components/Spinner/Spinner";
import StaticSidebarList from "@/components/StaticSidebarList/StaticSidebarList";
import UploadFile from "@/components/UploadFile/UploadFile";

/* CUSTOM HOOKS */
import { useAuth } from "@/context/AuthContext";
import useFirestore from "@/hooks/firebase_db/useFirestore";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/hooks";
import { bookListInitialize } from "@/lib/redux/features/bookSlice";
import { setAllTags } from "@/lib/redux/features/moreActionSlice";

export default function Category() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const params = useSearchParams();
  const tag = params.get("tag");

  const dispatch = useAppDispatch();
  const { bookList } = useAppSelector((state) => state.book);
  const { user } = useAuth();

  //Solve the dispatch in effect dependency array problem
  const dispatchCallback = useCallback(dispatch, [dispatch]);
  const firestoreCallback = useCallback(useFirestore, [useFirestore]);

  useEffect(() => {
    const getBookList = async () => {
      try {
        setIsLoading(true);
        if (!tag) {
          const bookList = await firestoreCallback().getDocuments(
            `/users/${user.uid}/${pathname.split("/").pop()}`
          );
          dispatchCallback(bookListInitialize(bookList));
        } else {
          // const bookList = await firestoreCallback().searchByQuery(`/users/${user.uid}`)
        }
        const data = await firestoreCallback().searchByQuery(
          `/users`,
          "email",
          "==",
          "test@test.com"
        );
        dispatch(setAllTags(data[0].tags));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    getBookList();
  }, [user, dispatchCallback, firestoreCallback, pathname, dispatch]);

  return (
    <>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Image
            src="/image/Readify.png"
            alt="readify logo"
            width={70}
            height={70}
          />
          <StaticSidebarList />
        </nav>
        <section className={styles.middle_container}>
          <Topbar />
          {isLoading && <Spinner />}
          {!isLoading && bookList.length === 0 && (
            <p className={styles.empty_hint}>
              Ooops...! There is no book in this category!
            </p>
          )}
          {!isLoading && bookList.length > 0 && (
            <BookList bookList={bookList} />
          )}
        </section>
      </div>
      <UploadFile />
    </>
  );
}
