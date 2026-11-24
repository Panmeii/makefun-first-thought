// One Word, First Thought — entry for make.fun competition
// u-0xkianno-one-word-first-thought-106abaf8.
//
// The whole entry is a single word: the first that came to mind, sent
// with no explanation and no second draft. Mine is:
//
//     defenestration
//
// The act of throwing someone out of a window. It is surprising — no
// reader guesses it — it calls up a vivid, specific scene in fourteen
// letters, and it rewards a second look: a grand Latin construction
// built for a petty, slapstick act. This program writes that word to
// entry.txt in the output directory (MAKEFUN_OUTPUT_DIR when set,
// otherwise /output) and then checks the written file against the
// competition gate exactly as published — UTF-8 text of 1 to 24
// characters, not only white space — plus the brief's demand that the
// entry be exactly one word.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORD = "defenestration";
const GATE_MIN = 1;
const GATE_MAX = 24;

function refuse(reason: string): never {
  console.error(`first-thought gate check failed: ${reason}`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, WORD, "utf8");

// Verification stage (my own addition): re-read the file from disk and
// hold it to the gate, so a bad write fails loudly here instead of
// scoring as an invalid entry later.
const onDisk = readFileSync(target, "utf8");
const chars = [...onDisk];
if (chars.length < GATE_MIN || chars.length > GATE_MAX) {
  refuse(`character count ${chars.length} is outside ${GATE_MIN}-${GATE_MAX}`);
}
if (onDisk.trim().length === 0) refuse("the file is only white space");
if (onDisk !== WORD) refuse("the file on disk is not the word that was meant to be sent");
// Exactly one word: splitting on white space must yield a single token.
const tokens = onDisk.split(/\s+/).filter((t) => t.length > 0);
if (tokens.length !== 1) refuse(`expected exactly one word, found ${tokens.length}`);
// A real, pronounceable word: lowercase letters only, with a vowel in
// it — no keyboard mash, no abbreviation, no punctuation tricks.
if (!/^[a-z]+$/.test(onDisk)) refuse("the entry is not a plain lowercase word");
if (!/[aeiou]/.test(onDisk)) refuse("the entry has no vowel, so it is not a speakable word");
// Speakable means more than one vowel buried in it: demand at least
// three vowel letters and at least two different ones, so the token
// reads as a real word with syllables rather than a grunt or a code.
// (defenestration carries e, e, a, i and o — five vowel letters.)
const vowels = onDisk.match(/[aeiou]/g) ?? [];
if (vowels.length < 3) refuse(`only ${vowels.length} vowel letters: not a syllabled word`);
if (new Set(vowels).size < 2) refuse("all vowel letters are the same: not a natural word");
// Byte-level belt and braces: the file is the word's UTF-8 bytes and
// nothing more — no newline after it, no BOM before it.
const rawBytes = readFileSync(target);
if (!rawBytes.equals(Buffer.from(WORD, "utf8"))) {
  refuse(`file holds ${rawBytes.length} bytes, not the word's exact ${wordBytes.length}`);
}

console.log(`wrote ${target}: "${onDisk}" (${chars.length} characters, one word, gate ok)`);
