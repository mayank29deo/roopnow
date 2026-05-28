# Email hero images

Suraksha's Sheet 6 spec — each transactional email references a hero
image by exact filename. Drop the JPG/PNG files here with the
filenames below and they resolve automatically (the email client
fetches from `https://roopnow.com/email-images/<name>.jpg`).

| Filename | Used by | Visual |
|----------|---------|--------|
| `welcome.jpg` | `notifyWelcome` (customer + artist) | "WE HEARD YOU!" red telephone |
| `request-sent.jpg` | `notifyBookingRequested` → customer ack | "You're This Close To..." hand pinching |
| `confirmed.jpg` | `notifyBookingDecided` → customer (both accept and reject) | Wax-seal floral frame |
| `request-received.jpg` | `notifyBookingRequested` → artist | Red shopping bag on door |
| `booking-confirmed-artist.jpg` | `notifyBookingDecided` → artist (accept only) | Red satin |

## What if the file isn't here?

The email still sends — the `<img>` tag just renders broken until the
file is uploaded. Safe to drop these in after the code ships.

## Format recommendations

- **Width:** 600 px (matches the email card width; the `<img>` tag has `width="600"` and `max-width:600px`)
- **Format:** JPG for photographs, PNG only if you need transparency
- **Size:** under 300 KB each — Gmail clips total messages over a few MB
