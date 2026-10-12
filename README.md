# CalorieAI

CalorieAI ist eine deutschsprachige, offline nutzbare Ernährungs-App für iOS und Android. Sie läuft mit Expo/React Native und kann deshalb ohne eigenen Mac entwickelt und auf einem iPhone getestet werden. Mahlzeiten, Ziele, Wasser und Gewicht liegen lokal in SQLite. KI-Bilder werden nur nach ausdrücklicher Einwilligung an das separat betriebene Backend gesendet.

## Lokal starten – ohne Mac

Benötigt werden Node.js 20 oder neuer und die kostenlose App **Expo Go** auf dem iPhone.

```bash
npm install
npx expo start --tunnel
```

Danach den QR-Code mit dem iPhone scannen. Kamera, Barcode-Scanner, lokale Datenbank und Open-Food-Facts-Suche funktionieren auf einem echten Gerät. Wenn das lokale Netzwerk die direkte Verbindung zulässt, ist `npm start` schneller als der Tunnel.

## KI-Backend konfigurieren

Der OpenAI-Schlüssel gehört ausschließlich auf den Server. Im Ordner `backend`:

```bash
cd backend
npm install
cp .env.example .env
# CALORIEAI_OPENAI_KEY in .env sicher eintragen
npm start
```

Anschließend im App-Hauptordner `.env.example` nach `.env` kopieren und `EXPO_PUBLIC_AI_BASE_URL` auf die öffentliche HTTPS-Adresse des Backends setzen. Diese Variable enthält nur eine öffentliche URL, keinen geheimen Schlüssel. Das Backend begrenzt Uploads auf 8 MB, hält Bilder nur im Arbeitsspeicher und speichert sie nicht dauerhaft.

## iOS-Cloud-Build ohne Mac

Für einen installierbaren Development Build oder den App Store werden ein Expo-Konto und für iOS ein kostenpflichtiger Apple-Developer-Account benötigt:

```bash
npm install --global eas-cli
eas login
eas init
eas build --platform ios --profile development
```

`eas init` ersetzt die Platzhalter-ID in `app.json`. Signierung und Build laufen auf EAS-Servern. Für einen ersten Test reicht Expo Go und es ist kein Apple-Developer-Account nötig.

## Qualität prüfen

```bash
npm run typecheck
npm test
npx expo export --platform web
```

## Implementiert

- Onboarding mit Mifflin-St-Jeor-Schätzung, Ziel, Aktivität, Ernährungsform und Allergien
- fünf Hauptbereiche mit Light/Dark Mode und Dynamic-Type-tauglichen nativen Komponenten
- SQLite-Persistenz und vollständiger Offline-Betrieb für persönliche Einträge
- Dashboard aus real gespeicherten Mahlzeiten, Makros, Ballaststoffen und Wasser
- Produktsuche und Barcode-Abfrage über Open Food Facts, manuelle Eingabe und Portionsrechnung
- Kamera- und Fotoanalyse über ein sicheres, mitgeliefertes KI-Backend; Unsicherheit und Einwilligung sind sichtbar
- Kalender mit Tages-, Wochen- und Monatsansicht sowie 7-Tage-Auswertung
- KI-Ernährungsassistent unter Berücksichtigung von Zielen, Ernährung, Vorlieben und Allergien
- Gewichtstracker, manuell anpassbare Ziele, CSV-Export und vollständige lokale Datenlöschung
- Unit-Tests für Energie-, Portions-, Summen-, Alters- und Datumsberechnungen

## Noch externe Einrichtung nötig

- KI-Funktionen benötigen das bereitgestellte Backend und einen dort hinterlegten API-Schlüssel.
- E-Mail/Apple-Anmeldung und Cloud-Synchronisation benötigen ein eigenes Supabase- oder Firebase-Projekt.
- Apple Health kann in Expo Go nicht geladen werden. Dafür wird ein EAS Development Build mit einem passenden nativen HealthKit-Modul und Apple-Entitlements benötigt.
- App-Store-Veröffentlichung erfordert Apple-Developer-Konto, Datenschutz-URL, Store-Texte und eine abschließende Prüfung auf echten Geräten.

Die App zeigt keine vorgetäuschten Scanner- oder KI-Ergebnisse. Netzwerkfehler und fehlende Konfiguration werden als solche gemeldet.
