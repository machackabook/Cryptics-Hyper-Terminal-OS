# GSEL Wave Hue Gradient Engine

The supplied renderer is published as `/gsel-wave-gradient-engine.html` and launched
from the Hyperterminal command palette. It keeps the WebGL text-mask, palette,
wave-frequency, speed, amplitude, saturation, brightness, typography and glyph
metadata controls in a same-origin static surface.

The integration removes external font hosts and inline executable/style content,
bounds the seed to 240 characters, updates glyph metadata with text nodes,
does not use browser persistence or network requests, and reports a clear
unsupported-WebGL state. The route has a no-index meta policy; the publication
headers remain the outer boundary.
