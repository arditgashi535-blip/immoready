#!/bin/sh
# Zusammenhängender Gesamtlauf: npm test (Build, RISE, t15, t7, t9, t11, t14, t16–t22) und t12/t13 mit lokalen Servern.
# Ausgabe: shots/testlauf.log · Exitcode ≠ 0, sobald irgendeine Prüfung fehlschlägt.
cd "$(dirname "$0")/.." || exit 2
mkdir -p shots; LOG=shots/testlauf.log; : > "$LOG"
npm test >> "$LOG" 2>&1; A=$?
python3 -m http.server 8702 --bind 127.0.0.1 >/dev/null 2>&1 & S1=$!
(cd tests/harness && exec python3 -m http.server 8701 --bind 127.0.0.1 >/dev/null 2>&1) & S2=$!
(cd tests/harness && exec python3 -m http.server 8703 --bind 127.0.0.1 >/dev/null 2>&1) & S3=$!
sleep 2
node tests/t12.js >> "$LOG" 2>&1; B=$?
node tests/t13-component.js >> "$LOG" 2>&1; C=$?
kill $S1 $S2 $S3 2>/dev/null
P=$(grep -c '^PASS' "$LOG"); F=$(grep -c '^FAIL' "$LOG")
echo "GESAMT: $P bestanden, $F fehlgeschlagen (npm test exit $A, t12 exit $B, t13 exit $C)" | tee -a "$LOG"
[ "$F" -eq 0 ] && [ "$A" -eq 0 ]
