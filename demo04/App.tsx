import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

    const tekstikentta = useRef<TextInput>(null);
    const [tervehdys, setTervehdys] = useState<string>('');

    const sanoHeippa = () => {
        const nimi = (tekstikentta.current as any)?.value ?? '';
        setTervehdys(`Heippa ${nimi}!`);
        tekstikentta.current?.clear();
    };

    return (
        <SafeAreaView style={styles.container}>

            <Text style={{ fontSize: 20 }}>Demo 4: React Native -perusteita</Text>

            <Text style={styles.alaotsikko}>Hello world</Text>

            <TextInput
                ref={tekstikentta}
                style={styles.tekstikentta}
                placeholder="Anna nimesi..."
                onChangeText={(teksti) => {
                    if (tekstikentta.current) {
                        (tekstikentta.current as any).value = teksti;
                    }
                }}
            />

            <Button
                title="Sano heippa"
                onPress={sanoHeippa}
            />

            {Boolean(tervehdys) && <Text style={styles.tervehdys}>{tervehdys}</Text>}

            <StatusBar style="auto" />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 0,
        padding: 10,
    },
    alaotsikko: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    tekstikentta: {
        marginBottom: 20,
    },
    tervehdys: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 20,
    },
});
