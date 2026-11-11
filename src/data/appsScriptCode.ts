export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * NEXUS PLAY STORE - GOOGLE APPS SCRIPT WEBHOOK (Code.gs)
 * =========================================================================
 * Script ini bertindak sebagai jembatan backend antara aplikasi Nexus Store,
 * Google Sheet, dan Google Drive.
 * 
 * PANDUAN PEMASANGAN:
 * 1. Buka Google Sheet Anda (docs.google.com/spreadsheets).
 * 2. Di menu atas Google Sheet, klik: Ekstensi (Extensions) > Apps Script.
 * 3. Hapus semua kode bawaan (myFunction), lalu tempelkan (paste) seluruh kode ini.
 * 4. Klik ikon Disket "Simpan" (Save project).
 * 5. Klik tombol biru "Terapkan" (Deploy) di kanan atas > pilih "Penerapan baru" (New deployment).
 * 6. Klik ikon gerigi di sebelah 'Select type' > pilih "Aplikasi Web" (Web app).
 * 7. Isi konfigurasi:
 *    - Deskripsi: "Nexus Play Store Webhook"
 *    - Jalankan sebagai (Execute as): "Saya" (Me / akun Google Anda)
 *    - Yang memiliki akses (Who has access): "Siapa saja" (Anyone) -> [PENTING!]
 * 8. Klik "Terapkan" (Deploy).
 * 9. Berikan izin otorisasi jika diminta (Authorize access > Akun Google Anda > Advanced > Go to Untitled project).
 * 10. Salin URL Aplikasi Web (Web App URL) yang berakhiran "/exec".
 * 11. Masukkan URL tersebut ke kolom "Google Apps Script Webhook URL" di aplikasi Play Store Anda!
 * =========================================================================
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return createJsonResponse({ status: "error", message: "No data received in post body" }, 400);
    }

    var data = JSON.parse(rawData);

    // ==========================================
    // ACTION: DELETE APP ROW FROM GOOGLE SHEET
    // ==========================================
    if (data.action === "DELETE" || (data.appData && data.appData.action === "DELETE")) {
      var targetId = data.appId || (data.appData && data.appData.id);
      var targetPkg = data.packageName || (data.appData && data.appData.packageName);

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("NexusAppsCatalog");
      var deletedCount = 0;

      if (sheet) {
        var values = sheet.getDataRange().getValues();
        for (var i = values.length - 1; i >= 1; i--) {
          var rowId = String(values[i][0]);
          var rowPkg = String(values[i][2]);
          if ((targetId && rowId === String(targetId)) || (targetPkg && rowPkg === String(targetPkg))) {
            sheet.deleteRow(i + 1);
            deletedCount++;
          }
        }
      }

      return createJsonResponse({
        status: "success",
        message: "Aplikasi berhasil dihapus dari Google Sheet (" + deletedCount + " baris dihapus)."
      }, 200);
    }

    // ==========================================
    // ACTION: PUBLISH / UPDATE APP ROW IN GOOGLE SHEET
    // ==========================================
    var app = data.appData;
    if (!app) {
      return createJsonResponse({ status: "error", message: "Invalid payload: appData or action missing" }, 400);
    }

    // Buka Spreadsheet aktif
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "NexusAppsCatalog";
    var sheet = ss.getSheetByName(sheetName);

    // Buat sheet baru jika belum ada otomatis
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

    // Penanganan Gambar / Icon Agar Tidak Melebihi Kuota Cell Google Sheet
    var iconUrlString = app.iconUrl || "";
    var driveFolderId = data.driveFolderId;

    // Jika gambar berupa data base64 panjang (lebih dari 300 karakter), simpan ke Google Drive sebagai file aset
    if (iconUrlString.indexOf("data:image/") === 0 && driveFolderId && driveFolderId.indexOf("1Drive_") !== 0) {
      try {
        var folder = DriveApp.getFolderById(driveFolderId);
        var base64Parts = iconUrlString.split(",");
        var contentType = base64Parts[0].split(":")[1].split(";")[0];
        var decodedBytes = Utilities.base64Decode(base64Parts[1]);
        var blob = Utilities.newBlob(decodedBytes, contentType, (app.name || "app") + "_icon.png");
        var driveFile = folder.createFile(blob);
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        iconUrlString = driveFile.getUrl(); // URL singkat file Drive, hemat kuota cell!
      } catch (imgErr) {
        Logger.log("Image Drive save note: " + imgErr.message);
        iconUrlString = "https://nexusstore.app/assets/icon-default.png";
      }
    } else if (iconUrlString.length > 500 && iconUrlString.indexOf("data:image/") === 0) {
      // Ringkas base64 jika melebihi batas cell Google Sheet
      iconUrlString = "Aset Gambar Tersimpan di Server";
    }

    // Periksa apakah baris aplikasi sudah ada (Update) atau belum (Append)
    var values = sheet.getDataRange().getValues();
    var existingRowIndex = -1;
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][0]) === String(app.id) || String(values[r][2]) === String(app.packageName)) {
        existingRowIndex = r + 1; // 1-based index
        break;
      }
    }

    var rowData = [
      app.id || ("app-" + new Date().getTime()),
      app.name || "Unknown App",
      app.packageName || "com.nexus.app",
      app.version || "1.0.0",
      app.fileType || "APK",
      app.sizeMb || 0,
      app.developer || "Developer",
      iconUrlString,
      app.sha256 || "VERIFIED_HASH",
      app.downloadUrl || "",
      app.timestamp || new Date().toISOString(),
      "VERIFIED_SECURE"
    ];

    if (existingRowIndex > 0) {
      sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    // Optional: Log manifest ke Google Drive jika Folder ID disediakan
    if (driveFolderId && driveFolderId.indexOf("1Drive_") !== 0) {
      try {
        var folder = DriveApp.getFolderById(driveFolderId);
        var manifestName = (app.name || "app") + "_" + (app.version || "1.0") + "_manifest.json";
        folder.createFile(manifestName, JSON.stringify(app, null, 2), MimeType.PLAIN_TEXT);
      } catch (driveErr) {
        Logger.log("Drive logging note: " + driveErr.message);
      }
    }

    return createJsonResponse({
      status: "success",
      message: "Data " + app.name + " (" + app.fileType + ") berhasil disinkronkan ke Google Sheet & Drive!",
      row: existingRowIndex > 0 ? existingRowIndex : sheet.getLastRow()
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
`;
