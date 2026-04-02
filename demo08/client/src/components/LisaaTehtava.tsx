import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useContext, useRef } from "react";
import { TehtavaContext } from "../context/TehtavaContext";
import type { Tehtava } from "../context/TehtavaContext";

const LisaaTehtava = () => {
  const { lisaysDialogi, setLisaysDialogi, lisaaTehtava } =
    useContext(TehtavaContext);

  const nimiRef = useRef<HTMLInputElement>(null);

  const kasitteleLisays = (): void => {
    const uusiTehtava: Tehtava = {
      id: crypto.randomUUID(),
      nimi: nimiRef.current!.value || "(nimetön tehtävä)",
      suoritettu: false,
    };

    lisaaTehtava(uusiTehtava);

    setLisaysDialogi(false);
  };

  return (
    <Dialog
      open={lisaysDialogi}
      onClose={() => setLisaysDialogi(false)}
      fullWidth={true}
      slotProps={{ paper: { sx: { position: "fixed", top: 100 } } }}
    >
      <DialogTitle>Lisää uusi tehtävä</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={nimiRef}
          variant="outlined"
          label="Tehtävän nimi"
          fullWidth={true}
          sx={{ marginTop: "10px" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={kasitteleLisays}>Lisää</Button>
        <Button onClick={() => setLisaysDialogi(false)}>Peruuta</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LisaaTehtava;
