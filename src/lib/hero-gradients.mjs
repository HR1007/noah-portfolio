/**
 * 案例頁 hero 可用的漸層名稱——單一來源。
 *
 * content schema（驗證值）、後台（下拉選單）都讀這一支；實際色值定義在
 * src/styles/tokens.css 的 --gradient-<name>。新增一組漸層要動兩個地方：
 * 這裡加名稱、tokens.css 加色值，其餘不必改。
 */
export const HERO_GRADIENTS = ['warm', 'cool', 'violet', 'mint', 'slate'];
