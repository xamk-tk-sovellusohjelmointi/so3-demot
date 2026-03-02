import { StatusBar } from 'expo-status-bar';
import { View, Vibration } from 'react-native';
import { Appbar, Button, List, PaperProvider } from 'react-native-paper';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import { useEffect, useState } from 'react';

export default function App() {

    const [akkulataus, setAkkulataus] = useState<number>(0);
    const [latauksessa, setLatauksessa] = useState<string>('');

    useEffect(() => {

        (async () => {
            setAkkulataus(await Battery.getBatteryLevelAsync());
            const tila = await Battery.getBatteryStateAsync();
            if (tila === Battery.BatteryState.CHARGING || tila === Battery.BatteryState.FULL) {
                setLatauksessa('Kyllä');
            } else {
                setLatauksessa('Ei');
            }
        })();

        const latausKuuntelija = Battery.addBatteryStateListener((e: Battery.BatteryStateEvent) => {
            if (e.batteryState === Battery.BatteryState.CHARGING || e.batteryState === Battery.BatteryState.FULL) {
                setLatauksessa('Kyllä');
            } else {
                setLatauksessa('Ei');
            }
        });

        return () => latausKuuntelija.remove();

    }, []);

    return (
        <PaperProvider>
            <Appbar.Header>
                <Appbar.Content title="Demo 5: Laitekomponentit" />
                <Appbar.Action icon="atom" />
            </Appbar.Header>
            <View style={{ marginHorizontal: 10 }}>

                <List.Accordion
                    title="Perustietoja laitteesta"
                    left={props => <List.Icon {...props} icon="memory" />}
                >
                    <List.Item title="Merkki" description={Device.brand ?? 'Ei saatavilla'} />
                    <List.Item title="Malli" description={Device.modelName ?? 'Ei saatavilla'} />
                    <List.Item title="Käyttöjärjestelmä" description={Device.osName ?? 'Ei saatavilla'} />
                    <List.Item title="Versio" description={Device.osVersion ?? 'Ei saatavilla'} />
                </List.Accordion>

                <List.Accordion
                    title="Akkutietoja"
                    left={props => <List.Icon {...props} icon="battery" />}
                >
                    <List.Item title="Latauksen määrä" description={`${(100 * akkulataus).toFixed(2)} %`} />
                    <List.Item title="Latauksessa" description={latauksessa} />
                </List.Accordion>

                <Button
                    style={{ marginVertical: 10 }}
                    mode="contained"
                    onPress={() => Vibration.vibrate(2000)}
                    icon="vibrate"
                >Värinää!</Button>

                <StatusBar style="auto" />
            </View>
        </PaperProvider>
    );
}
