import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import cors from 'cors';
import { google } from 'googleapis';

const app = express();
const PORT = 3000;
const DATA_FILE = decodeURIComponent(
  new URL('./submissions.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
);
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const CALENDAR_TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Sao_Paulo';

app.use(cors());
app.use(express.json());

function createAppError(message, code, status = 500) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function getCalendarClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    throw createAppError(
      'Google Calendar nao configurado. Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI e GOOGLE_REFRESH_TOKEN.',
      'CALENDAR_NOT_CONFIGURED'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

function parseDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!start || !end || Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || endDate <= startDate) {
    throw createAppError('Invalid date/time range.', 'INVALID_DATE_RANGE', 400);
  }
  return { startDate, endDate };
}

function readSubmissions() {
  if (!existsSync(DATA_FILE)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

app.get('/submissions', (_req, res) => {
  const submissions = readSubmissions();
  res.json(submissions);
});

app.post('/calendar/availability', async (req, res) => {
  try {
    const { start, end } = req.body ?? {};
    const { startDate, endDate } = parseDateRange(start, end);

    let calendar;
    try {
      calendar = getCalendarClient();
    } catch (configError) {
      if (configError.code === 'CALENDAR_NOT_CONFIGURED') {
        console.warn('[Calendar] Credentials not configured — skipping availability check.');
        return res.json({ isBusy: false, calendarEnabled: false });
      }
      throw configError;
    }

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busySlots = response.data?.calendars?.[CALENDAR_ID]?.busy ?? [];
    res.json({
      isBusy: busySlots.length > 0,
      busySlots,
      calendarEnabled: true,
    });
  } catch (error) {
    console.error('[Calendar] availability error:', error);
    res.status(error.status || 500).json({
      code: error.code || 'CALENDAR_AVAILABILITY_ERROR',
      message: error.message || 'Error checking availability on Google Calendar.',
    });
  }
});

app.post('/calendar/bookings', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      services = [],
      quote,
      start,
      end,
      fullAddress,
    } = req.body ?? {};

    if (!name || !email || !start || !end) {
      res.status(400).json({
        code: 'MISSING_BOOKING_DATA',
        message: 'Missing required data to create booking.',
      });
      return;
    }

    const { startDate, endDate } = parseDateRange(start, end);

    let calendar;
    try {
      calendar = getCalendarClient();
    } catch (configError) {
      if (configError.code === 'CALENDAR_NOT_CONFIGURED') {
        console.warn('[Calendar] Credentials not configured — skipping event creation.');
        return res.json({ skipped: true, reason: 'CALENDAR_NOT_CONFIGURED' });
      }
      throw configError;
    }

    const event = {
      summary: `CleanNest - ${name}`,
      location: fullAddress || '',
      description: [
        `Customer: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : '',
        services.length ? `Services: ${services.join(', ')}` : '',
        quote?.total ? `Estimated value: $${Number(quote.total).toFixed(2)}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      start: {
        dateTime: startDate.toISOString(),
        timeZone: CALENDAR_TIMEZONE,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: CALENDAR_TIMEZONE,
      },
      attendees: [{ email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    res.json({
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      status: response.data.status,
    });
  } catch (error) {
    console.error('[Calendar] booking error:', error);
    res.status(error.status || 500).json({
      code: error.code || 'CALENDAR_BOOKING_ERROR',
      message: error.message || 'Error creating appointment in Google Calendar.',
    });
  }
});

app.post('/submit', (req, res) => {
  const data = req.body;

  const submissions = readSubmissions();

  submissions.push({
    ...data,
    receivedAt: new Date().toISOString(),
  });
  writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));

  res.json({ message: 'Data received and saved successfully!' });
});

app.listen(PORT, () => {
  console.log(`[CleanNest API] Running at http://localhost:${PORT}`);
});
