"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import styles from "./SignupForm.module.css";
import ButtonCta from "../ButtonCta/ButtonCta";
import Spinner from "../Spinner/Spinner";

import useFirebaseAuth from "@/hooks/firebase_auth/useFirebaseAuth";
import useFireStore from "@/hooks/firebase_db/useFirestore";

type dataType = {
  firstName: string;
  email: string;
  password: string;
};

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function SignupForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const firebaseAuth = useFirebaseAuth();
  const firestore = useFireStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<dataType> = async (data) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const userUid = await firebaseAuth.userSignUp(data.email, data.password);
      if (userUid !== undefined) {
        await firestore.setDocument("users", userUid, data);
        const isUserSignIn = await firebaseAuth.userSignin(
          data.email,
          data.password
        );
        console.log(isUserSignIn);
      } else {
        setErrorMessage(
          "A user is already registered with this e-mail address."
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isProcessing ? (
        <Spinner />
      ) : (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.form__data}>
            <input
              type="text"
              id="name"
              className={styles.form__input}
              {...register("firstName")}
            />
            <label htmlFor="name" className={styles.form__label}>
              Name
            </label>
            {errors.firstName && (
              <p className={styles.error_message}>{errors.firstName.message}</p>
            )}
          </div>
          <div className={styles.form__data}>
            <input
              type="text"
              id="email"
              className={styles.form__input}
              {...register("email")}
            />
            <label htmlFor="email" className={styles.form__label}>
              Email
            </label>
            {errors.email && (
              <p className={styles.error_message}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.form__data}>
            <input
              type="password"
              id="password"
              {...register("password")}
              className={styles.form__input}
            />
            <label htmlFor="password" className={styles.form__label}>
              Password
            </label>
            {errors.password && (
              <p className={styles.error_message}>{errors.password.message}</p>
            )}
          </div>
          {errorMessage && (
            <p className={styles.error_message_firebase}>{errorMessage}</p>
          )}
          <ButtonCta color="green">Sign up</ButtonCta>
        </form>
      )}
    </>
  );
}