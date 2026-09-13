# Android 16 Target SDK + 16 KB Page Size — Promote to Production

Use this prompt to start a fresh Claude session with the claude-in-chrome connector.

---

## Prompt

PickMe Games (`com.pattar.readyplayerone`) was updated to target Android 16 (API 36) to satisfy a Google Play policy requirement, and separately hit a blocking "app does not support 16 KB memory page sizes" error when creating a production release. Both are now fixed and verified. Build 11 is uploaded to Google Play's **Internal testing** track and needs manual device QA, then promotion to Production.

### Context

- EAS build ID: `e0454120-ff99-4cf8-96ac-b13aebc953f7`
- versionCode: `11`, versionName: `1.2.0`
- Target API 36 fix shipped in commit `47552d7` on branch `release/v1.2.0` (expo-build-properties override, no full Expo SDK upgrade — project is on Expo SDK 53).
- 16 KB page size fix: root cause was `expo-image`, a direct dependency that was never actually imported anywhere in the app (all screens use `@tamagui/image` instead). `expo-image` pulled in Glide's AVIF integration and Fresco's animated-GIF decoder, neither built with 16 KB page alignment upstream. Fix: removed the unused `expo-image` dependency entirely, and added `plugins/withFrescoAlignmentFix.js` to exclude Fresco's `animated-gif` module (safe — Fresco degrades gracefully via reflection checks; unlike Glide's AVIF integration, which does not — see the false-start notes below if this ever needs revisiting).
- Verified directly (not just "the build passed"): downloaded the built `.aab`, parsed the ELF program headers of all 20 native `.so` files, confirmed every `LOAD` segment in both 64-bit ABIs (`arm64-v8a`, `x86_64`) is aligned to 16384 bytes.
- Build 11 was submitted to Internal testing via `eas submit` and completed without any Play Console compliance rejection.
- **Do not** try to re-submit or re-upload a versionCode that's already claimed by another track — Play rejects that ("You've already submitted this version of the app"). Always create a new build (new versionCode, `autoIncrement: true` in eas.json handles this) if another change is needed, and use Play Console's **Promote release** action to move an existing artifact between tracks without re-uploading.
- Google granted a 1-month extension on the original API-36 compliance deadline, so there's no hard time pressure — pause and confirm with the user before finalizing rather than rushing.
- **Known gap, needs manual verification**: `edgeToEdgeEnabled: true` was set in `app.config.js` because Android 16 forces edge-to-edge display regardless of the old opt-out flag. This wasn't tested on a real Android 16 device/emulator (none available in the dev environment at the time). Specifically check the header/status-bar area — the app previously had a status-bar-clipping bug (fixed in commit `8312b61`) that could plausibly resurface under forced edge-to-edge if any custom top-anchored UI doesn't respect safe-area insets.
- R8/ProGuard (`enableProguardInReleaseBuilds`) is currently OFF. Google's "missing deobfuscation file" item is a warning, not a blocker, and was deliberately deferred — enabling it surfaced real Glide/AVIF crash risk before `expo-image` was removed. It's likely safe to enable now that `expo-image` and Glide are gone, but should get its own tested pass rather than being bundled into a rushed release.

### What to do

1. Install build 11 on a real Android 16 device or emulator (Internal testing track, or download the `.aab`/derived `.apk` directly from the EAS build page). Check specifically:
   - Header/status bar area isn't clipped or overlapping (edge-to-edge risk noted above).
   - Images still render correctly everywhere (`@tamagui/image` usage, now that `expo-image` is gone).
   - General smoke test of core flows.
2. Open Google Play Console in Chrome, navigate to PickMe Games → **Testing → Internal testing**, confirm version code 11 is there and the "16 KB memory page sizes" error is gone from the production release creation flow.
3. Once QA passes, click **Promote release** → select **Production** as the target track.
4. Confirm rollout percentage with the user (default to 100% / full rollout unless they say otherwise) before finishing the promotion.
5. Complete the promotion.
6. Go to **Policy → App content → Policy status** and confirm both the API-36 target-level warning and the 16 KB page size error show resolved.

### Verification

- Play Console shows version code 11 live on the Production track.
- Both policy warnings are gone (or show "resolved").
- Report back the rollout percentage and confirmation URL/screenshot to the user.
