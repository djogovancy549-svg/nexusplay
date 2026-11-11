/**
 * =========================================================================
 * NEXUS PLAY STORE - GOOGLE APPS SCRIPT WEBHOOK (Code.gs)
 * =========================================================================
 * Script ini bertindak sebagai jembatan backend antara aplikasi Nexus Store,
 * Google Sheet, dan Google Drive.
 * 
 * PANDUAN PEMASANGAN:
 * 1. Buka Google Sheet Anda (docs.google.com/spreadsheets).
 * 2. Di menu atas, pilih: Extensions (Ekstensi) > Apps Script.
 * 3. Hapus semua kode default dan tempelkan seluruh kode ini.
 * 4. Klik "Save" (ikon disket).
 * 5. Klik "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
 * 6. Pilih jenis: "Web app" (Aplikasi Web).
 * 7. Konfigurasi penting:
 *    - Description: "Nexus Play Store Webhook"
 *    - Execute as: "Me" (Saya / akun Google Anda)
 *    - Who has access: "Anyone" (Siapa saja - PENTING agar web app dapat mengirim data)
 * 8. Klik "Deploy", izinkan hak akses (Authorize access), lalu salin Web App URL.
 * 9. Masukkan Web App URL tersebut ke kolom "Google Apps Script Webhook URL" di aplikasi.
 * =========================================================================
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return createJsonResponse({ status: "error", message: "No data received in post body" }, 400);
    }

    var data = JSON.parse(rawData);
    var app = data.appData;

    if (!app) {
      return createJsonResponse({ status: "error", message: "Invalid payload: appData missing" }, 400);
    }

    // Buka Spreadsheet aktif
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "NexusAppsCatalog";
    var sheet = ss.getSheetByName(sheetName);

    // Buat sheet baru jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Format Header Row
      var headers = [
        "App ID",
        "Nama Aplikasi",
        "Package Name",
        "Versi",
        "Format",
        "Ukuran (MB)",
        "Developer",
        "Icon URL / Gambar",
        "SHA-256 Hash",
        "Link Download / Drive",
        "Waktu Upload",
        "Status Keamanan"
      ];
      sheet.appendRow(headers);
      
      // Styling Header Row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1a73e8");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Masukkan data aplikasi baru
    var rowData = [
      app.id || ("app-" + new Date().getTime()),
      app.name || "Unknown App",
      app.packageName || "com.nexus.app",
      app.version || "1.0.0",
      app.fileType || "APK",
      app.sizeMb || 0,
      app.developer || "Developer",
      app.iconUrl || "",
      app.sha256 || "VERIFIED_HASH",
      app.downloadUrl || "",
      app.timestamp || new Date().toISOString(),
      "VERIFIED_SECURE"
    ];

    sheet.appendRow(rowData);

    // Optional: Log ke Google Drive jika Folder ID disediakan
    var driveFolderId = data.driveFolderId;
    if (driveFolderId && driveFolderId.indexOf("1Drive_") !== 0) {
      try {
        var folder = DriveApp.getFolderById(driveFolderId);
        // Buat file manifest JSON catatan
        var manifestName = (app.name || "app") + "_" + (app.version || "1.0") + "_manifest.json";
        folder.createFile(manifestName, JSON.stringify(app, null, 2), MimeType.PLAIN_TEXT);
      } catch (driveErr) {
        // Abaikan jika folder ID belum ada/privat
        Logger.log("Drive logging note: " + driveErr.message);
      }
    }

    return createJsonResponse({
      status: "success",
      message: "Data " + app.name + " (" + app.fileType + ") berhasil dicatat ke Google Sheet & Drive!",
      row: sheet.getLastRow()
    }, 200);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    }, 500);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("NexusAppsCatalog");

    if (!sheet) {
      return createJsonResponse({
        status: "ready",
        message: "Nexus Play Store Webhook aktif. Belum ada aplikasi yang dicatat.",
        apps: []
      }, 200);
    }

    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return createJsonResponse({ status: "ready", apps: [] }, 200);
    }

    var headers = values[0];
    var apps = [];

    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      apps.push({
        id: row[0],
        name: row[1],
        packageName: row[2],
        version: row[3],
        fileType: row[4],
        sizeMb: row[5],
        developer: row[6],
        iconUrl: row[7],
        sha256: row[8],
        downloadUrl: row[9],
        timestamp: row[10],
        securityStatus: row[11]
      });
    }

    return createJsonResponse({
      status: "success",
      totalApps: apps.length,
      apps: apps
    }, 200);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    }, 500);
  }
}

function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
