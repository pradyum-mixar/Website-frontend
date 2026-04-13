# Deployment verification & troubleshooting

Production deploys are automated: any push to `main` triggers `.github/workflows/deploy.yml`,
which builds with `npm run build`, syncs `dist/` to S3, uploads `index.html` separately with
no-cache headers, and invalidates the CloudFront distribution. The bucket name and distribution
ID are stored as GitHub Actions secrets (`S3_FRONTEND_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`).

The build pulls four secrets that get baked into the bundle: `VITE_API_BASE_URL`,
`VITE_DOWNLOAD_URL_WINDOWS`, `VITE_DOWNLOAD_URL_MACOS`, `VITE_DOWNLOAD_URL_LINUX`.

---

## 1. Check the GitHub Actions run

```sh
gh run list --repo Mixar-AI/mixie-frontend --limit 5
gh run view <run-id> --log   # full logs
```

Or check the Actions tab directly on GitHub.

---

## 2. Verify what's in S3

```sh
# List what was actually deployed
aws s3 ls s3://mixar-frontend-prod/ --recursive --human-readable

# Check index.html specifically
aws s3 cp s3://mixar-frontend-prod/index.html - | head -50
```

Cache strategy to keep in mind when debugging stale content:

- Hashed assets under `/assets/` are uploaded with `Cache-Control: public,max-age=31536000,immutable` (one year).
- `index.html` is uploaded with `Cache-Control: no-cache,no-store,must-revalidate` so clients always re-fetch it.

If a user sees stale JS/CSS but a fresh `index.html`, the asset names should differ on every build — verify the hashes changed.

---

## 3. Check CloudFront is serving the right content

```sh
# Bypass CloudFront cache with a unique query string
curl -I "https://d27vgp8qegya1s.cloudfront.net/?nocache=$(date +%s)"

# Check what headers CloudFront is returning
curl -v "https://d27vgp8qegya1s.cloudfront.net/" 2>&1 | grep -E "< (HTTP|Cache|X-Cache|Age)"
```

Key headers to look for:

- `X-Cache: Hit from cloudfront` vs `Miss from cloudfront`
- `Age: 0` means fresh, high number means cached

---

## 4. Force a CloudFront invalidation (if you see stale content)

The workflow already runs an invalidation on every deploy, but you can force one manually:

```sh
aws cloudfront create-invalidation \
  --distribution-id E2GK8KP810J168 \
  --paths "/*"
```

---

## 5. Check browser console / network tab

- Open DevTools → Network tab → hard reload (Cmd+Shift+R)
- Look for 403/404s on JS/CSS chunks
- Check that `VITE_API_BASE_URL` is correct: in the built bundle, the JS should reference `https://api.mixar.app`

```sh
# Verify the env var was baked in correctly
aws s3 cp s3://mixar-frontend-prod/index.html - | grep -o 'api\.mixar\.app'

# The download URLs are also baked in — spot-check one
aws s3 sync s3://mixar-frontend-prod/assets/ /tmp/mixar-assets/ --quiet
grep -rho 'https://[^"]*\.dmg' /tmp/mixar-assets/ | head -1
```

---

## 6. React Router 404s on direct navigation (the most common issue)

This is a SPA — every route is rendered client-side by React Router. If navigating directly
to a deep link like `/auth/login`, `/app`, or `/changelog` returns a blank page, an XML error,
or a generic CloudFront error page, then CloudFront's custom error responses are not configured
to fall back to `index.html`.

```sh
aws cloudfront get-distribution-config --id E2GK8KP810J168 \
  --query 'DistributionConfig.CustomErrorResponses'
```

Should show both 403→`/index.html` (200) and 404→`/index.html` (200). The 403 mapping is the
important one — S3 returns 403 (not 404) for missing keys when the bucket isn't configured for
public listing, which is the common case behind a CloudFront origin.
