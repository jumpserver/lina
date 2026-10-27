# Audit report font

Noto Sans SC, distributed under the SIL Open Font License 1.1 (see OFL.txt).
Source: https://github.com/google/fonts/tree/main/ofl/notosanssc

NotoSansSC-Regular.ttf is the static weight-400 instance of NotoSansSC[wght].ttf, generated with fontTools. It retains the complete character map, including Latin and CJK characters. The font is loaded locally for report preview and PDF export; exported PDFs embed only the glyphs they use.

Noto Sans Regular is the fallback for common symbols and Unicode replacement characters. Source: https://github.com/google/fonts/tree/main/ofl/notosans (weight 400, width 100). Its license is distributed in public/licenses/NotoSans-OFL.txt; the CJK license is also distributed in public/licenses/NotoSansSC-OFL.txt.

Static TrueType files are intentional: fontkit repeatedly decompresses WOFF tables during subsetting, causing large CJK reports to freeze. TrueType avoids that overhead. All fonts load on demand; PDF files embed only used glyphs.

Noto Sans KR provides characters absent from the other fonts, including Korean Hangul. Source: https://github.com/google/fonts/tree/main/ofl/notosanskr (weight 400); the license is distributed in public/licenses/NotoSansKR-OFL.txt. Its static TrueType file is subset to characters not covered by the other report fonts.

Glyph data is padded to two-byte boundaries when the static fonts are generated. This keeps the PDF font subset offsets valid and prevents missing glyphs.
