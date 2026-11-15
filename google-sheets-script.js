/**
 * NAISHVI EVENT EMPIRE - Google Sheets & Automatic Email Dispatcher Script
 * 
 * Target Email: naishvieventempire@gmail.com
 * Contact Phone: +91 8279622416
 * 
 * -----------------------------------------------------------------------------
 * HOW TO SET THIS UP IN 2 MINUTES (100% FREE):
 * -----------------------------------------------------------------------------
 * 1. Open Google Sheets at https://sheets.google.com and create a new blank spreadsheet.
 *    Name it: "Naishvi Event Empire - Orders & Bookings Database"
 * 
 * 2. In Google Sheets top menu, click: Extensions -> Apps Script
 * 
 * 3. Delete any default code in the editor, then COPY and PASTE this entire script.
 * 
 * 4. Click the Save icon (floppy disk) or press Ctrl + S.
 * 
 * 5. Click: Deploy -> New deployment
 *    - Click the Gear icon next to "Select type" and choose "Web app"
 *    - Description: "Naishvi Website Sync"
 *    - Execute as: "Me (your Google email)"
 *    - Who has access: "Anyone"
 * 
 * 6. Click "Deploy", then click "Authorize access" (choose your Google account, click Advanced -> Go to Untitled Project (unsafe), and click Allow).
 * 
 * 7. COPY the "Web app URL" (it looks like: https://script.google.com/macros/s/AKfycb.../exec)
 * 
 * 8. Open your website in browser, and in the Admin Portal or in store.js, paste your Web app URL.
 *    Every order/booking will automatically:
 *      (1) Append a row to your Google Sheet in real time
 *      (2) Send a full HTML order confirmation email to naishvieventempire@gmail.com!
 */

const ADMIN_EMAIL = "naishvieventempire@gmail.com";

function doPost(e) {
  try {
    const raw = e.postData.contents;
    const body = JSON.parse(raw);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const sheetName = body.sheet || "Bookings";
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Auto-create headers if first row is empty
    if (sheet.getLastRow() === 0) {
      if (sheetName === "Bookings") {
        sheet.appendRow([
          "Timestamp",
          "Booking ID",
          "Customer Name",
          "Mobile Number",
          "Email",
          "Event Date",
          "Location / Venue",
          "Guest Count",
          "Selected Functions",
          "Selected Services",
          "Package Tier",
          "Estimated Budget",
          "Special Requests",
          "Status"
        ]);
        sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
      } else if (sheetName === "Pandit_Ji_Poojas") {
        sheet.appendRow([
          "Timestamp",
          "Ref ID",
          "Yajman Name",
          "Mobile Number",
          "Ceremony Name",
          "Date & Time",
          "Agra Location",
          "Language",
          "Samagri Status",
          "Status"
        ]);
        sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
      } else {
        sheet.appendRow(["Timestamp", "Name", "Mobile", "City", "Message", "Status"]);
        sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
      }
    }
    
    const d = body.data || body;
    
    // 1. APPEND ROW TO GOOGLE SHEET
    if (sheetName === "Bookings") {
      sheet.appendRow([
        d.timestamp || new Date().toLocaleString(),
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
        d.timestamp || new Date().toLocaleString(),
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
        d.timestamp || new Date().toLocaleString(),
        d.customerName || "",
        d.mobile || "",
        d.location || "",
        d.notes || "",
        "New Lead"
      ]);
    }
    
    // 2. AUTOMATIC EMAIL NOTIFICATION TO naishvieventempire@gmail.com
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
          Naishvi Event Empire • Shahdra, Agra, UP • Automated Google Sheets & Mail Sync
        </p>
      </div>
    `;
    
    MailApp.sendEmail({
      to: targetEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", bookingId: d.bookingId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
