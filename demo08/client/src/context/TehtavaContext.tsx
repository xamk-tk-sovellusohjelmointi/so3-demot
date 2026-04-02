import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

export interface Tehtava {
  id: string;
  nimi: string;
  suoritettu: boolean;
}

export interface PoistoDialogi {
  tehtava: Tehtava;
  auki: boolean;
}

export interface TehtavaContextType {
  tehtavat: Tehtava[];
  setTehtavat: Dispatch<SetStateAction<Tehtava[]>>;
  lisaysDialogi: boolean;
  setLisaysDialogi: Dispatch<SetStateAction<boolean>>;
  poistoDialogi: PoistoDialogi;
  setPoistoDialogi: Dispatch<SetStateAction<PoistoDialogi>>;
  lisaaTehtava: (uusiTehtava: Tehtava) => void;
  poistaTehtava: (id: string) => void;
  vaihdaSuoritus: (id: string) => void;
}

export const TehtavaContext = createContext<TehtavaContextType>(null!);

interface Props {
  children: ReactNode;
}

export const TehtavaProvider = ({ children }: Props) => {
  const haettu = useRef(false);

  const [lisaysDialogi, setLisaysDialogi] = useState<boolean>(false);
  const [poistoDialogi, setPoistoDialogi] = useState<PoistoDialogi>({
    tehtava: { id: "", nimi: "", suoritettu: false },
    auki: false,
  });

  const [tehtavat, setTehtavat] = useState<Tehtava[]>([]);

  const lisaaTehtava = (uusiTehtava: Tehtava): void => {
    tallennaTehtavat([...tehtavat, uusiTehtava]);
  };

  const vaihdaSuoritus = (id: string): void => {
    const paivitetyt = tehtavat.map((tehtava) =>
      tehtava.id === id
        ? { ...tehtava, suoritettu: !tehtava.suoritettu }
        : tehtava,
    );

    tallennaTehtavat(paivitetyt);
  };

  const poistaTehtava = (id: string): void => {
    tallennaTehtavat(tehtavat.filter((tehtava) => tehtava.id !== id));
  };

  const tallennaTehtavat = async (tehtavat: Tehtava[]) => {
    await fetch("http://localhost:3008/api/tehtavalista", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tehtavat }),
    });

    setTehtavat([...tehtavat]);
  };

  const haeTehtavat = async () => {
    const yhteys = await fetch("http://localhost:3008/api/tehtavalista");
    const data = await yhteys.json();
    setTehtavat(data);
  };

  useEffect(() => {
    if (!haettu.current) {
      haeTehtavat();
    }

    return () => {
      haettu.current = true;
    };
  }, []);

  return (
    <TehtavaContext.Provider
      value={{
        tehtavat,
        setTehtavat,
        lisaysDialogi,
        setLisaysDialogi,
        poistoDialogi,
        setPoistoDialogi,
        lisaaTehtava,
        poistaTehtava,
        vaihdaSuoritus,
      }}
    >
      {children}
    </TehtavaContext.Provider>
  );
};
