/**
 * Central configuration para evitar conflitos com outros PWAs
 * no mesmo GitHub Pages (mesmo usuário/diretório base).
 */

/** Prefixo usado em todas as URLs escopadas do app */
export const APP_PREFIX = 'espatifai'

/** Nome exibido no manifest, header e descrições */
export const APP_NAME = 'Espatifai'

/** Nome curto (short_name do manifest) */
export const APP_SHORT_NAME = 'Espatifai'

/** Descrição do app */
export const APP_DESCRIPTION = 'Seu player de música pessoal'

/** Cor tema do PWA */
export const THEME_COLOR = '#0f0f0f'

/** Cor de fundo do PWA */
export const BACKGROUND_COLOR = '#0f0f0f'

/** Escopo e base URL em produção */
export const PROD_BASE = `/${APP_PREFIX}/`

/** Artista padrão exibido nas faixas */
export const DEFAULT_ARTIST = APP_NAME
