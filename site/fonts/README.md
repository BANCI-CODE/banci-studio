# Current font system

See PORTFOLIO-FONTS.md for source evidence. Active CSS uses Bebas Neue, Alimama ShuHeiTi and Alibaba PuHuiTi. Earlier IBM Plex / Noto files are retained only for rollback.

Fonts are self-hosted WOFF2 with content hashes. PuHui contains the current site's Latin, Chinese and punctuation characters; new glyphs fall back to system fonts. Run scripts/subset-fonts.py with the installed PuHui font directory after adding content, review the generated subset, then update typography.css asset URLs. Font source files and font notices are preserved outside the published subset assets.
