/**
 * A small, hand-picked catalog of real ambient recordings from Freesound.org,
 * used in place of live search so every sound actually shipped has had its
 * license checked ahead of time. All entries below are CC0 (public domain) —
 * no attribution is legally required, but we credit them anyway as good
 * practice.
 *
 * `previewUrl` points directly at Freesound's own CDN (cdn.freesound.org),
 * the same public, CORS-open preview files their official embed widget
 * uses — so no API key, account, or server route is needed at all. If a
 * URL ever goes stale, open `sourceUrl` and re-grab the "-hq.mp3" link
 * from the page.
 *
 * `boost` is a per-sound volume multiplier layered under the user's master
 * ambient-volume setting — some recordings (rain especially, being mostly
 * quiet gaps between drops) are just naturally quieter than others at the
 * same linear volume, so this compensates without needing to touch the
 * master slider.
 */
export const AMBIENT_SOUNDS = {
  rain: {
    label: "Rain",
    title: "Soft Rain Loop",
    author: "_lynks",
    license: "CC0",
    sourceUrl: "https://freesound.org/people/_lynks/sounds/595717/",
    previewUrl: "https://cdn.freesound.org/previews/595/595717_2530992-hq.mp3",
    boost: 1.8,
  },
  thunderstorm: {
    label: "Thunderstorm",
    title: "Rain and Thunder Ambience",
    author: "sagamusix",
    license: "CC0",
    sourceUrl: "https://freesound.org/people/sagamusix/sounds/700358/",
    previewUrl: "https://cdn.freesound.org/previews/700/700358_9398458-hq.mp3",
    boost: 1,
  },
  white: {
    label: "White noise",
    title: "True White Noise - One Bit Depth",
    author: "Timbre",
    license: "CC0",
    sourceUrl: "https://freesound.org/people/Timbre/sounds/843519/",
    previewUrl: "https://cdn.freesound.org/previews/843/843519_1015240-hq.mp3",
    boost: 1,
  },
  brown: {
    label: "Brown noise",
    title: "Brown Noise (Medium)",
    author: "OldSlowVideogamer",
    license: "CC0",
    sourceUrl: "https://freesound.org/people/OldSlowVideogamer/sounds/365932/",
    previewUrl: "https://cdn.freesound.org/previews/365/365932_5857547-hq.mp3",
    boost: 1,
  },
  cafe: {
    label: "Café",
    title: "Coffee Shop Ambience (remastered)",
    author: "C_Rogers",
    license: "CC0",
    sourceUrl: "https://freesound.org/people/C_Rogers/sounds/453074/",
    previewUrl: "https://cdn.freesound.org/previews/453/453074_3569783-hq.mp3",
    boost: 1,
  },

};

export const AMBIENT_SOUND_KEYS = ["none", ...Object.keys(AMBIENT_SOUNDS)];
