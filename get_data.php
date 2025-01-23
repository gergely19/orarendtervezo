<?php
$tantargy = isset($_GET['name']) ? $_GET['name'] : '';
$felev = isset($_GET['semester']) ? $_GET['semester'] : '2024-2025-2';

if (empty($tantargy)) {
    echo json_encode(["error" => "Az oktató neve kötelező!"]);
    exit;
}

$encodedName = urlencode($tantargy);
$url = "https://tanrend.elte.hu/tanrendnavigation.php?k={$encodedName}&m=keres_kod_azon&f={$felev}";
//keresnevre, keres_kod_azon
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
    exit;
}

curl_close($ch);

// A szerver által megadott kódolás lekérése
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$encoding = null;

if (preg_match('/charset=([\w-]+)/i', $contentType, $matches)) {
    $encoding = $matches[1];
}

// Ha a kódolás nem UTF-8, konvertáljuk
if ($encoding && strtoupper($encoding) !== 'UTF-8') {
    $response = mb_convert_encoding($response, 'UTF-8', $encoding);
}

// HTML feldolgozása DOMDocument-tel
libxml_use_internal_errors(true);
$dom = new DOMDocument();
@$dom->loadHTML('<?xml encoding="UTF-8">' . $response); // Biztosítjuk, hogy UTF-8-at használjon
$xpath = new DOMXPath($dom);

// Táblázat sorainak keresése
$entries = $xpath->query('//table[contains(@id, "resulttable")]//tr');
$courses = [];

foreach ($entries as $entry) {
    $cols = $entry->getElementsByTagName('td');
    if ($cols->length > 0) {
        //0 - időpont
        //1 - kód,kurzus (előadás/gyakorlat)
        //2 - tantárgy neve
        //5 - oktató
        $idopont = trim($cols->item(0)->nodeValue);
        $tantargy = trim($cols->item(2)->nodeValue);
        $kodok = trim($cols->item(1)->nodeValue);
        $tanar = trim($cols->item(5)->nodeValue);

        $courses[] = [
            'idopont' => $idopont,           
            'tantargy' => $tantargy,
            'kodok' => $kodok,
            'tanar' => $tanar
        ];
    }
}

// JSON válasz UTF-8 kódolással
header('Content-Type: application/json; charset=utf-8');
echo json_encode($courses, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
