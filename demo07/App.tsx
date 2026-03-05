import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import { Appbar, Button, Dialog, List, PaperProvider, Portal, Text, TextInput } from 'react-native-paper';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';

interface Ostos {
    id: number;
    tuote: string;
}

interface DialogiData {
    auki: boolean;
    teksti: string;
}

async function alustaKanta(db: SQLiteDatabase): Promise<void> {
    await db.execAsync("DROP TABLE IF EXISTS ostokset");
    await db.execAsync(`
        CREATE TABLE ostokset (id INTEGER PRIMARY KEY AUTOINCREMENT, tuote TEXT);
        INSERT INTO ostokset (tuote) VALUES ('Maito');
        INSERT INTO ostokset (tuote) VALUES ('Kahvi');
        INSERT INTO ostokset (tuote) VALUES ('Leipä');
    `);
}

export default function App() {
    return (
        <SQLiteProvider databaseName="ostokset.db" onInit={alustaKanta}>
            <PaperProvider>

                <Appbar.Header>
                    <Appbar.Content title="Demo 7: SQLite" />
                </Appbar.Header>

                <Ostoslista />

                <StatusBar style="auto" />
                
            </PaperProvider>
        </SQLiteProvider>
    );
}

function Ostoslista() {

    const db = useSQLiteContext();
    const [dialogi, setDialogi] = useState<DialogiData>({ auki: false, teksti: "" });
    const [ostokset, setOstokset] = useState<Ostos[]>([]);

    const haeOstokset = async (): Promise<void> => {
        const rivit = await db.getAllAsync<Ostos>("SELECT * FROM ostokset");
        setOstokset(rivit);
    };

    const lisaaOstos = async (): Promise<void> => {
        await db.runAsync("INSERT INTO ostokset (tuote) VALUES (?)", dialogi.teksti);
        await haeOstokset();
        setDialogi({ ...dialogi, auki: false, teksti: "" });
    };

    const tyhjennaLista = async (): Promise<void> => {
        await db.runAsync("DELETE FROM ostokset");
        await haeOstokset();
    };

    useEffect(() => {
        haeOstokset();
    }, []);

    return (
        <>
            <ScrollView style={{ padding: 20 }}>

                <Text variant="headlineSmall">Ostoslista</Text>

                {ostokset.length > 0
                    ? ostokset.map((ostos) => (
                        <List.Item
                            key={ostos.id}
                            title={ostos.tuote}
                        />
                    ))
                    : <Text>Ei ostoksia</Text>
                }

                <Button
                    style={{ marginTop: 20 }}
                    mode="contained"
                    icon="plus"
                    onPress={() => setDialogi({ ...dialogi, auki: true })}
                >Lisää uusi ostos</Button>

                <Button
                    style={{ marginTop: 20 }}
                    buttonColor="red"
                    mode="contained"
                    icon="delete"
                    onPress={tyhjennaLista}
                >Tyhjennä lista</Button>

            </ScrollView>

            <Portal>
                <Dialog
                    visible={dialogi.auki}
                    onDismiss={() => setDialogi({ ...dialogi, auki: false })}
                >
                    <Dialog.Title>Lisää uusi ostos</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Ostos"
                            mode="outlined"
                            value={dialogi.teksti}
                            placeholder="Kirjoita ostos..."
                            onChangeText={(uusiTeksti) => setDialogi({ ...dialogi, teksti: uusiTeksti })}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={lisaaOstos}>Lisää listaan</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );
}
