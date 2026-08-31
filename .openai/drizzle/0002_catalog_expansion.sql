UPDATE products
SET name = '散养鸡蛋年卡',
    category = 'gift-card',
    category_label = '礼品卡',
    price_cents = 79800,
    inventory = CASE WHEN inventory > 100 THEN 100 ELSE inventory END,
    sales_status = '限量100张',
    sort_order = 40,
    data_json = '{"detail":"连续12个月 · 每月1箱30枚","spec":"12个月 × 30枚/箱","image":"/assets/egg-annual-card-2027.webp","origin":"山大王农场林下鸡舍 · 农场自产","delivery":"购卡后领取独立卡密，激活后自2027年1月起每月按批次发出1箱","storage":"卡密请妥善保管，激活后连续履约12个月","description":"一次送出一整年的惦记。激活后连续12个月，每月收到1箱30枚散养鸡蛋；每批完成捡取、灯检、分级和缓冲装托后发出。","batch":"2027 鸡蛋年卡 · 限量100张","harvest":"每月匹配当月鸡舍批次，共发出12箱","sceneImage":"/assets/farm-egg-checking.jpg","sceneTitle":"不是一次送完，而是每个月都记得","sceneBody":"年卡激活后建立12期履约计划。每月从当批鸡蛋中完成捡取、灯检与分级，再按固定30枚缓冲箱寄出。","fulfillment":{"temperature":"ambient","packageSystem":"gift-card","boxSize":"S","fragile":"low","compatibleWith":["gift"]}}',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'egg-annual-card';
