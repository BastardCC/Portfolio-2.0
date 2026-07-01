"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const TransitionReadyContext = createContext(false);
const SetTransitionReadyContext = createContext<
  Dispatch<SetStateAction<boolean>> | null
>(null);

export const useTransitionReady = () => useContext(TransitionReadyContext);

export const useSetTransitionReady = () => {
  const setter = useContext(SetTransitionReadyContext);
  if (!setter) {
    throw new Error("useSetTransitionReady must be used within TransitionProvider");
  }
  return setter;
};

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);
  const value = useMemo(() => ready, [ready]);

  return (
    <TransitionReadyContext.Provider value={value}>
      <SetTransitionReadyContext.Provider value={setReady}>
        {children}
      </SetTransitionReadyContext.Provider>
    </TransitionReadyContext.Provider>
  );
};
