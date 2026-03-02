import { StatusBar } from 'expo-status-bar';
import { FlatList, Image, StyleSheet } from 'react-native';
import { Appbar, Card, FAB, PaperProvider, Text } from 'react-native-paper';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useRef, useState } from 'react';

interface Kuvaustiedot {
    kuvaustila?: boolean;
    virhe: string;
    info: string;
}

interface OtettuKuva {
    uri: string;
    aikaleima: Date;
}

export default function App() {

    const [kameraLupa, pyydaKameraLupa] = useCameraPermissions();
    const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
        kuvaustila: false,
        virhe: "",
        info: ""
    });
    const [kuvat, setKuvat] = useState<OtettuKuva[]>([]);
    const kameraRef = useRef<CameraView>(null);

    const kaynnistaKamera = async () => {
        await pyydaKameraLupa();
        setKuvaustiedot({
            ...kuvaustiedot,
            kuvaustila: kameraLupa?.granted,
            virhe: (!kameraLupa?.granted) ? "Ei lupaa kameran käyttöön." : ""
        });
    }

    const otaKuva = async () => {

        setKuvaustiedot({
            ...kuvaustiedot,
            info: "Odota hetki..."
        });

        const kuva: CameraCapturedPicture = await kameraRef.current!.takePictureAsync();

        setKuvat([{ uri: kuva.uri, aikaleima: new Date() }, ...kuvat]);
        setKuvaustiedot({
            ...kuvaustiedot,
            kuvaustila: false,
            info: ""
        });

    }

    const aloitusNakyma = () => {
        return (
            <>
                <Appbar.Header>
                    <Appbar.Content title="Demo 6: Kamera" />
                    <Appbar.Action
                        icon="camera"
                        onPress={kaynnistaKamera}
                    />
                </Appbar.Header>

                {(Boolean(kuvaustiedot.virhe))
                    ? <Text style={styles.virhe}>{kuvaustiedot.virhe}</Text>
                    : null
                }

                <FlatList
                    data={kuvat}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.lista}
                    ListEmptyComponent={
                        <Text style={styles.tyhjaLista}>Ei otettuja kuvia.</Text>
                    }
                    renderItem={({ item }) => (
                        <Card style={styles.kortti}>
                            <Image
                                source={{ uri: item.uri }}
                                style={styles.korttiKuva}
                                resizeMode="contain"
                            />
                            <Card.Content>
                                <Text variant="bodySmall" style={styles.aikaleima}>
                                    {item.aikaleima.toLocaleString('fi-FI')}
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                />

                <StatusBar style="auto" />
            </>
        );
    }

    const kameraNakyma = () => {
        return (
            <CameraView style={styles.kuvaustila} ref={kameraRef}>

                {(Boolean(kuvaustiedot.info))
                    ? <Text style={{ color: "#fff" }}>{kuvaustiedot.info}</Text>
                    : null
                }

                <FAB
                    style={styles.nappiOtaKuva}
                    icon="camera"
                    label="Ota kuva"
                    onPress={otaKuva}
                />

                <FAB
                    style={styles.nappiSulje}
                    icon="close"
                    label="Sulje"
                    onPress={() => setKuvaustiedot({ ...kuvaustiedot, kuvaustila: false })}
                />

            </CameraView>
        );
    }

    return (
        <PaperProvider>
            {!kuvaustiedot.kuvaustila ? aloitusNakyma() : kameraNakyma()}
        </PaperProvider>
    );

}

const styles = StyleSheet.create({
    kuvaustila: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nappiSulje: {
        position: 'absolute',
        margin: 20,
        bottom: 0,
        left: 0
    },
    nappiOtaKuva: {
        position: 'absolute',
        margin: 20,
        bottom: 0,
        right: 0
    },
    lista: {
        padding: 10,
    },
    kortti: {
        marginBottom: 12,
    },
    korttiKuva: {
        width: '100%',
        aspectRatio: 3 / 4,
    },
    aikaleima: {
        marginTop: 8,
        color: '#666',
    },
    virhe: {
        margin: 10,
        color: 'red',
    },
    tyhjaLista: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
    },
});
