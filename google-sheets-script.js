/**
 * NAISHVI EVENT EMPIRE - Google Sheets & Cloud Drive Gallery Manager Script
 * Developer: Iamwurtzite (Rishik Upadhyay)
 * 
 * Target Admin Email: naishvieventempire@gmail.com
 * Contact Phone: +91 8279622416
 * 
 * -----------------------------------------------------------------------------
 * CAPABILITIES:
 * -----------------------------------------------------------------------------
 * 1. LIVE GALLERY PHOTO SYNC:
 *    - Uploads celebration photos directly to Google Drive folder ("Naishvi Website Gallery Uploads").
 *    - Generates high-speed, globally accessible universal CDN links (https://lh3.googleusercontent.com/d/...).
 *    - Saves records in the "Gallery" sheet tab.
 *    - Provides a live public API (doGet) so ALL visitors on ANY device can view uploaded photos in real-time!
 * 
 * 2. BOOKINGS & LEAD INTAKE:
 *    - Appends customer bookings to "Bookings" sheet.
 *    - Dispatches rich HTML email alerts to naishvieventempire@gmail.com.
 * 
 * 3. VEDIC PANDIT JI RITUALS:
 *    - Appends pooja requests to "Pandit_Ji_Poojas" sheet.
 * 
 * -----------------------------------------------------------------------------
 * HOW TO SET UP / UPDATE IN 2 MINUTES (100% FREE):
 * -----------------------------------------------------------------------------
 * 1. Open your Google Sheet at https://sheets.google.com
 *    (e.g., "Naishvi Event Empire - Orders & Bookings Database")
 * 
 * 2. In top menu, click: Extensions -> Apps Script
 * 
 * 3. Delete any old code in the editor, then COPY and PASTE this entire script.
 * 
 * 4. Click the Save icon (Ctrl + S).
 * 
 * 5. Click: Deploy -> Manage deployments (or New deployment)
 *    - If editing existing: Click Edit (pencil icon) -> Version: "New version" -> Deploy.
 *    - If new deployment:
 *        Click Gear icon -> Select "Web app"
 *        Description: "Naishvi Website Cloud Sync"
 *        Execute as: "Me (your Google email)"
 *        Who has access: "Anyone"
 *        Click "Deploy"
 * 
 * 6. Authorize access if prompted (Advanced -> Go to Untitled Project -> Allow).
 * 
 * 7. COPY your "Web app URL" (looks like: https://script.google.com/macros/s/AKfycb.../exec).
 * 
 * 8. Paste it into your Admin portal on admin.html (or in assets/js/config.js).
 *    Now all images will upload to your Google Drive/Sheets and be visible to ALL users instantly!
 */

const ADMIN_EMAIL = "naishvieventempire@gmail.com";
const DRIVE_FOLDER_NAME = "Naishvi Website Gallery Uploads";

/**
 * GET Handler - Public Read API
 * Fetches gallery photos so website visitors across all devices can view real celebration photos.
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getGallery";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "getGallery") {
      let sheet = ss.getSheetByName("Gallery");
      if (!sheet) {
        return createJsonResponse({ status: "success", count: 0, photos: [] });
      }

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return createJsonResponse({ status: "success", count: 0, photos: [] });
      }

      const photos = [];
      // Headers: [Timestamp, Photo ID, Category, Title, Location, Image URL, Drive File ID, Status]
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const photoId = String(row[1] || "").trim();
        const imageUrl = String(row[5] || "").trim();
        const status = String(row[7] || "Active").trim();

        if (photoId && imageUrl && status.toLowerCase() !== "deleted") {
          photos.push({
            timestamp: row[0],
            id: photoId,
            category: String(row[2] || "roka").toLowerCase(),
            title: String(row[3] || "Royal Celebration Moment"),
            location: String(row[4] || "Agra, UP"),
            image: imageUrl,
            fileId: String(row[6] || ""),
            status: status
          });
        }
      }

      // Newest photos first
      photos.reverse();
      return createJsonResponse({ status: "success", count: photos.length, photos: photos });
    }

    return createJsonResponse({ status: "success", message: "Naishvi Event Empire Cloud API is active." });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * POST Handler - Handles Image Uploads, Photo Deletions, and Bookings
 */
function doPost(e) {
  try {
    const raw = e.postData.contents;
    const body = JSON.parse(raw);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. GALLERY PHOTO UPLOAD
    if (body.action === "uploadGallery" || body.sheet === "Gallery") {
      return handleGalleryUpload(ss, body);
    }

    // 2. DELETE GALLERY PHOTO
    if (body.action === "deleteGallery") {
      return handleGalleryDelete(ss, body);
    }

    // 3. BOOKINGS & CLIENT INQUIRIES
    return handleBookingsAndEmails(ss, body);

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Uploads a photo to Google Drive and saves record to "Gallery" tab in Google Sheets
 */
function handleGalleryUpload(ss, body) {
  let sheet = ss.getSheetByName("Gallery");
  if (!sheet) {
    sheet = ss.insertSheet("Gallery");
  }

  // Create table headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Photo ID",
      "Category",
      "Title / Caption",
      "Location / Venue",
      "Image URL",
      "Drive File ID",
      "Status"
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
  }

  const p = body.photo || body.data || body;
  const photoId = p.id || ("gal_" + Date.now() + "_" + Math.floor(Math.random() * 1000));
  const category = (p.category || "roka").toLowerCase();
  const title = p.title || "Royal Celebration Moment";
  const location = p.location || "Agra, UP";
  let finalImageUrl = p.image || "";
  let driveFileId = "";

  // If image is Base64 data, store into Google Drive folder
  if (finalImageUrl.startsWith("data:image")) {
    try {
      const match = finalImageUrl.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const extension = mimeType.split("/")[1] || "jpg";
        const filename = category + "_" + Date.now() + "." + extension;
        const decoded = Utilities.base64Decode(base64Data);
        const blob = Utilities.newBlob(decoded, mimeType, filename);

        // Get or create dedicated Drive folder
        const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
        let folder;
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
          folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }

        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        driveFileId = file.getId();

        // Universal Google direct CDN image URL (renders in any browser worldwide)
        finalImageUrl = "https://lh3.googleusercontent.com/d/" + driveFileId;
      }
    } catch (driveErr) {
      Logger.log("Drive upload error: " + driveErr.toString());
    }
  }

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  sheet.appendRow([
    timestamp,
    photoId,
    category,
    title,
    location,
    finalImageUrl,
    driveFileId,
    "Active"
  ]);

  return createJsonResponse({
    status: "success",
    photo: {
      id: photoId,
      category: category,
      title: title,
      location: location,
      image: finalImageUrl,
      fileId: driveFileId,
      timestamp: timestamp,
      status: "Active"
    }
  });
}

/**
 * Deletes a photo from "Gallery" tab and trashes the file in Google Drive
 */
function handleGalleryDelete(ss, body) {
  const sheet = ss.getSheetByName("Gallery");
  if (!sheet) {
    return createJsonResponse({ status: "error", message: "Gallery sheet not found" });
  }

  const idToDelete = String(body.id || body.photoId || "").trim();
  if (!idToDelete) {
    return createJsonResponse({ status: "error", message: "Photo ID required" });
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === idToDelete) {
      const fileId = String(data[i][6] || "").trim();
      if (fileId) {
        try {
          DriveApp.getFileById(fileId).setTrashed(true);
        } catch (e) {
          Logger.log("Drive file deletion error: " + e.toString());
        }
      }
      sheet.deleteRow(i + 1);
      return createJsonResponse({ status: "success", message: "Photo deleted successfully", id: idToDelete });
    }
  }

  return createJsonResponse({ status: "error", message: "Photo not found" });
}

/**
 * Handles Bookings and Vedic Pandit Ji submissions + email dispatch
 */
function handleBookingsAndEmails(ss, body) {
  const sheetName = body.sheet || "Bookings";
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Auto-create headers
  if (sheet.getLastRow() === 0) {
    if (sheetName === "Bookings") {
      sheet.appendRow([
        "Timestamp", "Booking ID", "Customer Name", "Mobile Number", "Email",
        "Event Date", "Location / Venue", "Guest Count", "Selected Functions",
        "Selected Services", "Package Tier", "Estimated Budget", "Special Requests", "Status"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
    } else if (sheetName === "Pandit_Ji_Poojas") {
      sheet.appendRow([
        "Timestamp", "Ref ID", "Yajman Name", "Mobile Number", "Ceremony Name",
        "Date & Time", "Agra Location", "Language", "Samagri Status", "Status"
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
    } else {
      sheet.appendRow(["Timestamp", "Name", "Mobile", "City", "Message", "Status"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
    }
  }

  const d = body.data || body;

  if (sheetName === "Bookings") {
    sheet.appendRow([
      d.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      d.bookingId || "NC-" + Date.now(),
      d.customerName || "",
      d.mobile || "",
      d.email || "",
      d.eventDate || "",
      d.location || "",
      d.guests || "",
      d.events || "",
      d.services || "",
      d.package || "",
      d.budget || "",
      d.notes || "",
      d.status || "Pending"
    ]);
  } else if (sheetName === "Pandit_Ji_Poojas") {
    sheet.appendRow([
      d.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      d.bookingId || "PJ-" + Date.now(),
      d.customerName || "",
      d.mobile || "",
      d.ceremony || "",
      d.eventDate || "",
      d.location || "",
      d.language || "",
      d.samagri || "",
      d.status || "Pending"
    ]);
  } else {
    sheet.appendRow([
      d.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      d.customerName || "",
      d.mobile || "",
      d.location || "",
      d.notes || "",
      "New Lead"
    ]);
  }

  // Automatic Email Notification
  const targetEmail = body.adminEmail || ADMIN_EMAIL;
  const subject = "🎉 New Order / Booking Received - " + (d.customerName || "Valued Client") + " (" + (d.bookingId || "New") + ")";
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #0b0c10; color: #ffffff; border: 2px solid #d4af37; border-radius: 12px; padding: 24px;">
      <div style="text-align: center; border-bottom: 1px solid #d4af37; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px;">NAISHVI EVENT EMPIRE</h2>
        <p style="color: #eeddb0; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase;">New Event Booking & Order Notification</p>
      </div>
      
      <p style="font-size: 15px; color: #e5e7eb;">A new client booking order has been submitted on your website:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr style="background: rgba(212, 175, 55, 0.1);">
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37; width: 35%;">Booking ID:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.bookingId || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Customer Name:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.customerName || "N/A"}</td>
        </tr>
        <tr style="background: rgba(212, 175, 55, 0.1);">
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Mobile / WhatsApp:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;"><a href="tel:${d.mobile}" style="color: #60a5fa;">${d.mobile || "N/A"}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Email:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.email || "Not provided"}</td>
        </tr>
        <tr style="background: rgba(212, 175, 55, 0.1);">
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Event Date:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.eventDate || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Venue / Location:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.location || "Agra"}</td>
        </tr>
        <tr style="background: rgba(212, 175, 55, 0.1);">
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Guest Count:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.guests || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Ceremonies / Functions:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.events || "Wedding"}</td>
        </tr>
        <tr style="background: rgba(212, 175, 55, 0.1);">
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Selected Services:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.services || "All Inclusive"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Package / Tier:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.package || "Custom Package"}</td>
        </tr>
        <tr style="background: rgba(212, 175, 55, 0.1);">
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Budget Estimate:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #fbbf24; font-weight: bold;">${d.budget || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #374151; font-weight: bold; color: #d4af37;">Special Requests:</td>
          <td style="padding: 10px; border: 1px solid #374151; color: #ffffff;">${d.notes || "None"}</td>
        </tr>
      </table>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://api.whatsapp.com/send?phone=${String(d.mobile).replace(/[^0-9]/g, '')}" style="background: #25d366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 24px; font-weight: bold; display: inline-block;">
          Reply to Client on WhatsApp
        </a>
      </div>
      
      <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 24px; border-top: 1px solid #374151; padding-top: 12px;">
        Naishvi Event Empire • Shahdra, Agra, UP • Automated Google Sheets & Drive Sync
      </p>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: targetEmail,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (mErr) {
    Logger.log("Email dispatch error: " + mErr.toString());
  }

  return createJsonResponse({ status: "success", bookingId: d.bookingId });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
