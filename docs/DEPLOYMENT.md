# StayBali deployment operations

Deployment target is one Linux VPS with Nginx, Node.js, PostgreSQL, Redis, and systemd. Secrets belong only in `/etc/staybali/staybali.env`; never copy deployment values into this repository.

## Reservation expiry scheduler

The committed systemd units run the idempotent reservation cleanup command once per minute:

- `deployment/systemd/staybali-reservations-cleanup.service`
- `deployment/systemd/staybali-reservations-cleanup.timer`

Install the units on the VPS, then enable the timer:

```bash
sudo cp deployment/systemd/staybali-reservations-cleanup.* /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now staybali-reservations-cleanup.timer
```

Verify both the schedule and the most recent execution:

```bash
systemctl list-timers staybali-reservations-cleanup.timer
systemctl status staybali-reservations-cleanup.timer
journalctl -u staybali-reservations-cleanup.service -n 100 --no-pager
```

The service assumes releases are exposed through `/srv/staybali/current`, persistent writable data is under `/srv/staybali/shared`, and server-only environment variables are stored in `/etc/staybali/staybali.env`. Adjust these paths during initial provisioning if the VPS layout differs.

The cleanup command reconciles expired holds first and overdue payment bookings second. Both operations claim eligible rows conditionally and use serializable transactions, so delayed or repeated timer execution converges on the same inventory state.
